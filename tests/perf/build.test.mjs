// Production build checks: size budgets, pages readable without JavaScript, and
// loading speed on a slow phone. Needs a fresh `npm run build` (dist/).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { getBrowser, closeBrowser } from '../e2e/helpers.mjs';

const DIST = path.resolve('dist');
const PORT = 4310;
const BASE = `http://localhost:${PORT}`;
let server;

before(async () => {
  await stat(path.join(DIST, 'index.html'));
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  for (let i = 0; i < 60; i += 1) {
    if (await fetch(BASE).then((r) => r.ok, () => false)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('vite preview did not start');
});
after(async () => {
  await closeBrowser();
  server?.kill();
});

const gz = async (file) => gzipSync(await readFile(file)).length;
const kb = (n) => Math.round(n / 1024);

test('size budgets (gzip): main script, styles, language chunks, share images', async () => {
  const assets = path.join(DIST, 'assets');
  const files = await readdir(assets);
  const sized = await Promise.all(files.filter((f) => /\.(js|css)$/.test(f)).map(async (f) => ({ f, size: await gz(path.join(assets, f)) })));
  const main = sized.filter((x) => /^index-.*\.js$/.test(x.f)).sort((a, b) => b.size - a.size)[0];
  assert.ok(main.size <= 140 * 1024, `main script ${kb(main.size)} KB > 140 KB`);
  for (const css of sized.filter((x) => x.f.endsWith('.css'))) assert.ok(css.size <= 16 * 1024, `${css.f} ${kb(css.size)} KB`);
  for (const lang of sized.filter((x) => /^(hi|mr|bn|ta|te)-.*\.js$/.test(x.f))) assert.ok(lang.size <= 20 * 1024, `${lang.f} ${kb(lang.size)} KB`);
  const html = (await readFile(path.join(DIST, 'index.html'), 'utf8'));
  assert.ok(!html.includes('skyEngine'), 'Three.js is not loaded up front');
  for (const lang of await readdir(path.join(DIST, 'og'))) {
    for (const img of await readdir(path.join(DIST, 'og', lang))) {
      const { size } = await stat(path.join(DIST, 'og', lang, img));
      assert.ok(size <= 150 * 1024, `og/${lang}/${img} ${kb(size)} KB`);
    }
  }
});

test('pages are fully readable with JavaScript turned off', async () => {
  const ctx = await (await getBrowser()).newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  for (const p of ['/', '/hi', '/learn', '/learn/sade-sati', '/te/learn/how-to-read-a-kundli', '/about', '/privacy']) {
    await page.goto(`${BASE}${p}`);
    const h1 = await page.locator('h1').first().innerText();
    const text = await page.locator('main').innerText();
    const links = await page.locator('a[href^="/"]').count();
    assert.ok(h1.trim(), `${p} has a heading`);
    assert.ok(text.length > 400, `${p} has ${text.length} characters of text`);
    assert.ok(links >= 5, `${p} has crawlable links`);
  }
  await ctx.close();
});

test('loading speed on a slow phone (slow 4G, 4x slower CPU): LCP < 3 s, CLS < 0.1', async () => {
  // Warm the local preview server once (a CDN in production is always warm); the
  // measured visits below each use a fresh browser with an empty cache.
  const warm = await (await getBrowser()).newContext();
  const warmPage = await warm.newPage();
  for (const p of ['/', '/hi', '/learn/sade-sati', '/ta/learn/rahu-mahadasha']) await warmPage.goto(`${BASE}${p}`, { waitUntil: 'load' });
  await warm.close();

  const results = [];
  for (const p of ['/', '/hi', '/learn/sade-sati', '/ta/learn/rahu-mahadasha']) {
    const ctx = await (await getBrowser()).newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      window.__lcp = 0;
      window.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(`${BASE}${p}`, { waitUntil: 'load', timeout: 90_000 });
    await page.waitForTimeout(4000);
    const m = await page.evaluate(() => ({ lcp: window.__lcp, cls: window.__cls }));
    results.push(`${p}: LCP ${Math.round(m.lcp)} ms, CLS ${m.cls.toFixed(3)}`);
    assert.ok(m.lcp < 3000, `${p} LCP ${Math.round(m.lcp)} ms`);
    assert.ok(m.cls < 0.1, `${p} CLS ${m.cls}`);
    await ctx.close();
  }
  console.log(results.join('\n'));
});

test('404 page exists and is not indexed', async () => {
  const html = await readFile(path.join(DIST, '404.html'), 'utf8');
  assert.match(html, /<meta name="robots" content="noindex/);
  assert.match(html, /<h1>/);
});
