// Accessibility (axe-core, WCAG 2 A/AA), layout at phone-to-desktop widths, and
// console cleanliness across the main screens, in both themes.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { visitor, open, noErrors, closeBrowser } from './helpers.mjs';

after(closeBrowser);
const AXE = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

const PUBLIC_PAGES = ['/', '/learn', '/learn/sade-sati', '/learn/kundli-milan-guna-milan', '/hi', '/ta/learn/rahu-mahadasha', '/about', '/privacy', '/login', '/nope-404'];
const APP_PAGES = ['/chat', '/kundli', '/today', '/profile', '/settings'];

async function axe(page) {
  await page.addScriptTag({ path: AXE });
  return page.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    return res.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  });
}

for (const theme of ['vedic', 'cosmic']) {
  test(`accessibility: no serious WCAG issues (${theme} theme)`, async () => {
    const { page, errors, close } = await visitor({ storage: { astro_ai_theme: theme } });
    const problems = [];
    for (const path of [...PUBLIC_PAGES, ...APP_PAGES]) {
      await open(page, path);
      await page.waitForTimeout(600);
      for (const v of await axe(page)) problems.push(`${path}: ${v}`);
    }
    assert.deepEqual(problems, []);
    noErrors(errors, `${theme} pages`);
    await close();
  });
}

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1280, height: 860 },
];

test('layout: no sideways scrolling from 320px phones to desktop', async () => {
  const overflow = [];
  for (const viewport of VIEWPORTS) {
    const { page, close } = await visitor({ viewport });
    for (const path of [...PUBLIC_PAGES, ...APP_PAGES]) {
      await open(page, path);
      await page.waitForTimeout(400);
      const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (wide > 1) overflow.push(`${viewport.width}px ${path}: ${wide}px too wide`);
    }
    await close();
  }
  assert.deepEqual(overflow, []);
});

test('phones: bottom tabs reach every main screen', async () => {
  const { page, close } = await visitor({ viewport: { width: 375, height: 812 } });
  await open(page, '/kundli');
  const tabs = page.locator('nav.fixed[aria-label]');
  for (const [label, path] of [['Today', '/today'], ['Profile', '/profile'], ['Kundli', '/kundli'], ['Consult', '/chat']]) {
    await tabs.getByRole('button', { name: label }).click();
    await page.waitForURL(`**${path}`);
  }
  await close();
});

test('touch targets: buttons and links in the app are at least 32px tall', async () => {
  const { page, close } = await visitor({ viewport: { width: 375, height: 812 } });
  const small = [];
  for (const path of ['/', '/chat', '/settings']) {
    await open(page, path);
    small.push(
      ...(await page.evaluate(() =>
        [...document.querySelectorAll('main button, header button, nav button')]
          .filter((el) => el.offsetParent && !el.closest('[aria-hidden=true]'))
          .map((el) => [el, el.getBoundingClientRect()])
          .filter(([, r]) => r.height > 0 && r.height < 32)
          .map(([el, r]) => `${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)} (${Math.round(r.height)}px)`)
      )).map((s) => `${path}: ${s}`)
    );
  }
  assert.deepEqual(small, []);
  await close();
});
