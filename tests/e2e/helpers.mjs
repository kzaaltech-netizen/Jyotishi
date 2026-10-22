// Shared browser helpers for the end-to-end tests (Playwright + installed Chrome).
// The app must be running: `npm run dev` (port 5173, or set E2E_URL) and the API.

import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';

export const BASE = process.env.E2E_URL || 'http://localhost:5179';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

let browser;
export async function getBrowser() {
  browser ??= await chromium.launch({ executablePath: CHROME });
  return browser;
}
export async function closeBrowser() {
  await browser?.close();
  browser = null;
}

// A fresh visitor: own storage, own errors list. Console errors and page crashes are
// collected so each test can assert the page stayed clean.
export async function visitor({ viewport = { width: 1280, height: 860 }, locale = 'en-IN', storage = {} } = {}) {
  const ctx = await (await getBrowser()).newContext({ viewport, locale });
  if (Object.keys(storage).length) {
    await ctx.addInitScript((entries) => {
      for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
    }, storage);
  }
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    // Network failures of third-party services (fonts, geocoding) are not app errors.
    if (/Failed to load resource|net::ERR|fonts\.g|nominatim/i.test(text)) return;
    errors.push(`console: ${text}`);
  });
  page.setDefaultTimeout(30_000);
  return { ctx, page, errors, close: () => ctx.close() };
}

export async function open(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
}

export const pathOf = (page) => new URL(page.url()).pathname;
export const h1 = async (page) => (await page.locator('h1').first().innerText()).replace(/\s+/g, ' ').trim();

export function noErrors(errors, label = '') {
  assert.deepEqual(errors, [], `${label} page errors`);
}

export const unique = () => `qa.e2e.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 6)}@example.com`;
export const PASSWORD = 'e2e-pass-123';

// Fill the birth-details form in the chat and wait for the chart.
export async function makeChartInChat(page, { name = 'Asha Verma', dob = '1992-03-14', time = '06:45', place = 'Mumbai' } = {}) {
  await page.waitForSelector('#co-name');
  await page.fill('#co-name', name);
  await page.fill('#co-dob', dob);
  await page.fill('#co-time', time);
  await page.fill('#co-place', place);
  const firstMatch = page.locator('[aria-label="Matching places"] button, [role="listbox"] button').first();
  await firstMatch.click({ timeout: 8000 }).catch(() => {});
  await page.locator('form button[type=submit]').click();
  await page.waitForFunction(() => {
    const t = document.querySelector('textarea');
    return t && !t.disabled;
  }, null, { timeout: 120_000 });
}

// API helper for cleanup through the dev server's proxy.
export async function apiDelete(token, password) {
  await fetch(`${BASE}/api/auth/me`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(password ? { password } : {}),
  }).catch(() => {});
}

// Page changes animate out before the next screen mounts; wait for the heading.
export async function waitForH1(page, match, timeout = 30_000) {
  const source = match instanceof RegExp ? match.source : match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  await page.waitForFunction(
    ([src]) => new RegExp(src).test((document.querySelector('h1')?.textContent || '').replace(/\s+/g, ' ')),
    [source],
    { timeout }
  );
}

// Wait for the guide's reply. If the AI service is overloaded the chat shows a
// "busy" notice and puts the question back; send again like a person would.
// Returns true when a reply arrived, false if the AI stayed unavailable.
export async function waitForReply(page, { attempts = 3, wait = 150_000 } = {}) {
  for (let i = 0; i < attempts; i += 1) {
    const reply = page.getByRole('button', { name: 'Copy' }).first();
    const busy = page.locator('[role=alert]').filter({ hasText: /busy/i });
    await Promise.race([reply.waitFor({ timeout: wait }), busy.waitFor({ timeout: wait })]).catch(() => {});
    if (await reply.isVisible()) return true;
    if (!(await busy.isVisible())) return false;
    await page.waitForTimeout(20_000);
    await page.locator('button[aria-label="Send"]').click();
  }
  return false;
}
