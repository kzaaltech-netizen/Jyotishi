// ─── Nakshatra sky engine (Three.js) ─────────────────────────────────────────
// Renders a living star atlas behind the app:
//   • field   — faint background stars that twinkle
//   • band    — the other 26 nakshatras drifting slowly along an ecliptic band
//   • feature — the seeker's Moon nakshatra, drawn line by line, reacting to chat mood
// The engine is framework-free; NakshatraSky.jsx owns its lifecycle.

import * as THREE from 'three';
import { NAKSHATRA_CONSTELLATIONS } from '../../lib/nakshatra/nakshatraData.js';

const DATA_CX = 480;
const DATA_CY = 290;

const PALETTES = {
  vedic: {
    star: new THREE.Color('#5a3d22'),
    featureStar: new THREE.Color('#c2540a'),
    line: new THREE.Color('#6b4a2c'),
    featureLine: new THREE.Color('#a9440a'),
    blending: THREE.NormalBlending,
    fieldOpacity: 0.42,
    bandStarOpacity: 0.5,
    bandLineOpacity: 0.14,
    featureStarOpacity: 0.85,
    featureLineOpacity: 0.42,
    sharpness: 3.2,
  },
  cosmic: {
    star: new THREE.Color('#e6f6f4'),
    featureStar: new THREE.Color('#9bf2a1'),
    line: new THREE.Color('#7fd8cc'),
    featureLine: new THREE.Color('#2ee6c5'),
    blending: THREE.AdditiveBlending,
    fieldOpacity: 0.8,
    bandStarOpacity: 0.75,
    bandLineOpacity: 0.12,
    featureStarOpacity: 1,
    featureLineOpacity: 0.55,
    sharpness: 2.0,
  },
};

const POINT_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aBright;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uTwinkle;
  uniform float uPulse;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = 0.72 + 0.28 * sin(uTime * (0.5 + aPhase * 0.9) + aPhase * 6.2831);
    vAlpha = aBright * mix(1.0, tw, uTwinkle);
    float pulse = 1.0 + uPulse * 0.35 * (0.5 + 0.5 * sin(uTime * 2.4 + aPhase * 6.2831));
    gl_PointSize = aSize * uPixelRatio * pulse;
  }
`;

const POINT_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uSharpness;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), uSharpness) * vAlpha * uOpacity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

const LINE_VERT = /* glsl */ `
  attribute float aOrder;
  attribute float aAlpha;
  varying float vOrder;
  varying float vAlpha;
  void main() {
    vOrder = aOrder;
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uDraw;
  uniform float uTime;
  uniform float uShimmer;
  varying float vOrder;
  varying float vAlpha;
  void main() {
    float shown = smoothstep(vOrder, vOrder + 0.08, uDraw);
    float shimmer = 1.0 + uShimmer * 0.6 * sin(uTime * 3.2 - vOrder * 14.0);
    float a = shown * vAlpha * uOpacity * shimmer;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

// Parse the SVG-like path used by nakshatraData ("M x y L x y ... Z") into segments.
function parseSegments(path) {
  const segs = [];
  if (!path) return segs;
  const tokens = path.match(/[MLZ]|-?\d+(\.\d+)?/gi) || [];
  let cur = null;
  let start = null;
  let cmd = null;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/^[MLZ]$/i.test(t)) {
      cmd = t.toUpperCase();
      if (cmd === 'Z' && cur && start) {
        segs.push([cur, start]);
        cur = start;
      }
      continue;
    }
    const x = parseFloat(t);
    const y = parseFloat(tokens[++i]);
    const p = [x, y];
    if (cmd === 'M') {
      cur = p;
      start = p;
      cmd = 'L';
    } else if (cur) {
      segs.push([cur, p]);
      cur = p;
    }
  }
  return segs;
}

function toLocal([x, y], scale) {
  return [(x - DATA_CX) * scale, -(y - DATA_CY) * scale];
}

function pointMaterial(palette, color, opacity) {
  return new THREE.ShaderMaterial({
    vertexShader: POINT_VERT,
    fragmentShader: POINT_FRAG,
    transparent: true,
    depthWrite: false,
    blending: palette.blending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uTwinkle: { value: 1 },
      uPulse: { value: 0 },
      uColor: { value: color.clone() },
      uOpacity: { value: opacity },
      uSharpness: { value: palette.sharpness },
    },
  });
}

function lineMaterial(palette, color, opacity) {
  return new THREE.ShaderMaterial({
    vertexShader: LINE_VERT,
    fragmentShader: LINE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: palette.blending,
    uniforms: {
      uTime: { value: 0 },
      uDraw: { value: 1.2 },
      uShimmer: { value: 0 },
      uColor: { value: color.clone() },
      uOpacity: { value: opacity },
    },
  });
}

// Build Points + LineSegments for one constellation definition.
function buildConstellation(def, scale, palette, { feature = false } = {}) {
  const group = new THREE.Group();

  const stars = def.stars || [];
  const pos = new Float32Array(stars.length * 3);
  const size = new Float32Array(stars.length);
  const phase = new Float32Array(stars.length);
  const bright = new Float32Array(stars.length);
  stars.forEach((s, i) => {
    const [x, y] = toLocal([s.x, s.y], scale);
    pos.set([x, y, 0], i * 3);
    const base = s.type === 'bright' ? 1 : s.type === 'secondary' ? 0.8 : 0.62;
    size[i] = (feature ? 9 : 4.2) * base + (feature ? 3 : 1);
    phase[i] = Math.random();
    bright[i] = base;
  });
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  pGeo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  pGeo.setAttribute('aBright', new THREE.BufferAttribute(bright, 1));
  const pMat = pointMaterial(
    palette,
    feature ? palette.featureStar : palette.star,
    feature ? palette.featureStarOpacity : palette.bandStarOpacity
  );
  group.add(new THREE.Points(pGeo, pMat));

  const main = parseSegments(def.path);
  const harmonics = feature
    ? (def.harmonics || []).map((h) => [[h.x1, h.y1], [h.x2, h.y2]])
    : [];
  const all = [...main.map((s) => [s, 1]), ...harmonics.map((s) => [s, 0.35])];
  const lPos = new Float32Array(all.length * 6);
  const lOrder = new Float32Array(all.length * 2);
  const lAlpha = new Float32Array(all.length * 2);
  all.forEach(([[a, b], alpha], i) => {
    const [ax, ay] = toLocal(a, scale);
    const [bx, by] = toLocal(b, scale);
    lPos.set([ax, ay, 0, bx, by, 0], i * 6);
    const order = all.length > 1 ? i / (all.length - 1) : 0;
    lOrder.set([order, order], i * 2);
    lAlpha.set([alpha, alpha], i * 2);
  });
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
  lGeo.setAttribute('aOrder', new THREE.BufferAttribute(lOrder, 1));
  lGeo.setAttribute('aAlpha', new THREE.BufferAttribute(lAlpha, 1));
  const lMat = lineMaterial(
    palette,
    feature ? palette.featureLine : palette.line,
    feature ? palette.featureLineOpacity : palette.bandLineOpacity
  );
  group.add(new THREE.LineSegments(lGeo, lMat));

  return group;
}

function disposeGroup(group) {
  if (!group) return;
  group.traverse((o) => {
    o.geometry?.dispose?.();
    o.material?.dispose?.();
  });
  group.removeFromParent();
}

export function createSkyEngine(canvas, initial = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);

  const state = {
    width: 1,
    height: 1,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    theme: initial.theme === 'cosmic' ? 'cosmic' : 'vedic',
    nakshatra: initial.nakshatra || null,
    mood: 'idle',
    reduced: !!initial.reducedMotion,
    pointer: { x: 0, y: 0 },
    parallax: { x: 0, y: 0 },
    draw: 0,
    flash: 0,
    pulse: 0,
    running: false,
    raf: 0,
    clock: new THREE.Clock(),
  };

  let field = null;
  let band = null;
  let bandItems = [];
  let feature = null;

  const palette = () => PALETTES[state.theme];

  function featureDef() {
    const key = state.nakshatra;
    return key && NAKSHATRA_CONSTELLATIONS[key] ? NAKSHATRA_CONSTELLATIONS[key] : null;
  }

  function buildField() {
    disposeGroup(field);
    const { width: w, height: h } = state;
    const count = Math.min(900, Math.round((w * h) / 2600));
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const bright = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos.set([(Math.random() - 0.5) * w * 1.1, (Math.random() - 0.5) * h * 1.1, 0], i * 3);
      const r = Math.random();
      size[i] = r > 0.97 ? 4.2 : r > 0.85 ? 2.8 : 1.8;
      phase[i] = Math.random();
      bright[i] = 0.35 + Math.random() * 0.6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    geo.setAttribute('aBright', new THREE.BufferAttribute(bright, 1));
    const p = palette();
    field = new THREE.Points(geo, pointMaterial(p, p.star, p.fieldOpacity));
    field.renderOrder = 0;
    scene.add(field);
  }

  function buildBand() {
    disposeGroup(band);
    band = new THREE.Group();
    bandItems = [];
    const { width: w, height: h } = state;
    const keys = Object.keys(NAKSHATRA_CONSTELLATIONS).filter((k) => k !== state.nakshatra);
    const scale = Math.max(0.16, Math.min(0.26, Math.min(w, h) / 3600));
    const spacing = Math.max(260, 960 * scale * 1.25);
    const period = keys.length * spacing;
    keys.forEach((k, i) => {
      const g = buildConstellation(NAKSHATRA_CONSTELLATIONS[k], scale, palette());
      g.userData.base = i * spacing;
      g.userData.wave = Math.random() * Math.PI * 2;
      band.add(g);
      bandItems.push(g);
    });
    band.userData.period = period;
    band.userData.amp = h * 0.32;
    band.renderOrder = 1;
    scene.add(band);
  }

  function buildFeature() {
    disposeGroup(feature);
    feature = null;
    const def = featureDef();
    if (!def) return;
    const { width: w, height: h } = state;
    const wide = w >= 1024;
    const scale = Math.min((w * (wide ? 0.5 : 0.85)) / 960, (h * 0.62) / 620);
    feature = buildConstellation(def, scale, palette(), { feature: true });
    feature.position.set(wide ? w * 0.06 : 0, h * 0.04, 0);
    feature.userData.home = feature.position.clone();
    feature.renderOrder = 2;
    scene.add(feature);
    state.draw = state.reduced ? 1.2 : 0;
  }

  function forEachMaterial(cb) {
    scene.traverse((o) => o.material && cb(o.material, o));
  }

  function applyTheme() {
    const p = palette();
    if (field) {
      field.material.blending = p.blending;
      field.material.uniforms.uColor.value.copy(p.star);
      field.material.uniforms.uOpacity.value = p.fieldOpacity;
      field.material.uniforms.uSharpness.value = p.sharpness;
      field.material.needsUpdate = true;
    }
    const restyle = (group, isFeature) => {
      if (!group) return;
      group.children.forEach((child) => {
        const m = child.material;
        m.blending = p.blending;
        if (child.isPoints) {
          m.uniforms.uColor.value.copy(isFeature ? p.featureStar : p.star);
          m.uniforms.uOpacity.value = isFeature ? p.featureStarOpacity : p.bandStarOpacity;
          m.uniforms.uSharpness.value = p.sharpness;
        } else {
          m.uniforms.uColor.value.copy(isFeature ? p.featureLine : p.line);
          m.uniforms.uOpacity.value = isFeature ? p.featureLineOpacity : p.bandLineOpacity;
        }
        m.needsUpdate = true;
      });
    };
    bandItems.forEach((g) => restyle(g, false));
    restyle(feature, true);
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (w === state.width && h === state.height) return;
    state.width = w;
    state.height = h;
    renderer.setPixelRatio(state.pixelRatio);
    renderer.setSize(w, h, false);
    camera.left = -w / 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
    buildField();
    buildBand();
    buildFeature();
    forEachMaterial((m) => m.uniforms?.uPixelRatio && (m.uniforms.uPixelRatio.value = state.pixelRatio));
    renderOnce();
  }

  function update(dt, t) {
    const reduced = state.reduced;
    // Pointer parallax, eased.
    state.parallax.x += (state.pointer.x - state.parallax.x) * Math.min(1, dt * 2.5);
    state.parallax.y += (state.pointer.y - state.parallax.y) * Math.min(1, dt * 2.5);
    const px = reduced ? 0 : state.parallax.x;
    const py = reduced ? 0 : state.parallax.y;

    const thinking = state.mood === 'thinking';
    state.pulse += ((thinking ? 1 : 0) - state.pulse) * Math.min(1, dt * 3);
    state.flash = Math.max(0, state.flash - dt * 0.8);
    if (!reduced && state.draw < 1.2) state.draw = Math.min(1.2, state.draw + dt * 0.45);

    if (field) {
      field.position.set(px * 6, py * 6, 0);
      const u = field.material.uniforms;
      u.uTime.value = t;
      u.uTwinkle.value = reduced ? 0 : 1;
    }

    if (band) {
      const { width: w } = state;
      const period = band.userData.period;
      const drift = reduced ? 0 : t * 9;
      bandItems.forEach((g) => {
        let x = ((g.userData.base + drift) % period) - period / 2;
        if (period < w * 1.4) x *= (w * 1.4) / period;
        const tilt = -0.18 * x;
        const y = Math.sin(x / (w * 0.35) + g.userData.wave * 0.15) * band.userData.amp * 0.5 + tilt;
        g.position.set(x + px * 12, y + py * 12, 0);
        g.children.forEach((c) => {
          const u = c.material.uniforms;
          u.uTime.value = t;
          if (u.uTwinkle) u.uTwinkle.value = reduced ? 0 : 1;
        });
      });
    }

    if (feature) {
      const home = feature.userData.home;
      feature.position.set(home.x + px * 22, home.y + py * 22, 0);
      feature.rotation.z = reduced ? 0 : Math.sin(t * 0.08) * 0.025;
      const p = palette();
      feature.children.forEach((c) => {
        const u = c.material.uniforms;
        u.uTime.value = t;
        if (c.isPoints) {
          u.uPulse.value = state.pulse;
          u.uTwinkle.value = reduced ? 0 : 1;
          u.uOpacity.value = p.featureStarOpacity * (1 + state.flash * 0.4);
        } else {
          u.uDraw.value = state.draw;
          u.uShimmer.value = reduced ? 0 : state.pulse;
          u.uOpacity.value = p.featureLineOpacity * (1 + state.flash * 0.9 + state.pulse * 0.4);
        }
      });
    }
  }

  function renderOnce() {
    update(0, state.clock.getElapsedTime());
    renderer.render(scene, camera);
  }

  function loop() {
    if (!state.running) return;
    const dt = Math.min(0.05, state.clock.getDelta());
    update(dt, state.clock.elapsedTime);
    renderer.render(scene, camera);
    state.raf = requestAnimationFrame(loop);
  }

  function start() {
    if (state.running || state.reduced) return;
    state.running = true;
    state.clock.getDelta();
    state.raf = requestAnimationFrame(loop);
  }

  function stop() {
    state.running = false;
    cancelAnimationFrame(state.raf);
  }

  const onPointer = (e) => {
    state.pointer.x = (e.clientX / state.width - 0.5) * 2;
    state.pointer.y = -(e.clientY / state.height - 0.5) * 2;
  };
  const onVisibility = () => (document.hidden ? stop() : start());
  const onResize = () => resize();

  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  if (state.reduced) renderOnce();
  else start();

  return {
    setTheme(theme) {
      const next = theme === 'cosmic' ? 'cosmic' : 'vedic';
      if (next === state.theme) return;
      state.theme = next;
      applyTheme();
      renderOnce();
    },
    setNakshatra(key) {
      if (key === state.nakshatra) return;
      state.nakshatra = key || null;
      buildBand();
      buildFeature();
      renderOnce();
    },
    setMood(mood) {
      if (mood === 'answer' && state.mood !== 'answer') state.flash = 1;
      state.mood = mood || 'idle';
      if (state.reduced) renderOnce();
    },
    setReducedMotion(reduced) {
      state.reduced = !!reduced;
      if (state.reduced) {
        stop();
        state.draw = 1.2;
        renderOnce();
      } else {
        start();
      }
    },
    dispose() {
      stop();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      disposeGroup(field);
      disposeGroup(band);
      disposeGroup(feature);
      renderer.dispose();
    },
  };
}
