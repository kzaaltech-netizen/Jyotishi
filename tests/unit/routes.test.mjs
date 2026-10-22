// URL <-> screen mapping (src/lib/routes.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathFor, parsePath, PUBLIC_PAGES, ACCOUNT_PAGES, LOCALIZED_PAGES, INFO_PAGE_KEYS } from '../../src/lib/routes.js';
import { LOCALES } from '../../src/content/locales.js';
import { GUIDES } from '../../src/content/learn.js';

const SCREENS = ['splash', 'auth', 'onboarding', 'dashboard', 'kundli', 'horoscope', 'analysis', 'wallet', 'buy-tokens', 'premium', 'profile', 'settings', 'learn', ...INFO_PAGE_KEYS];

test('every screen has an address that parses back to the same screen', () => {
  for (const page of SCREENS) {
    const parsed = parsePath(pathFor(page));
    assert.equal(parsed.page ?? 'splash', page, `round trip for ${page}`);
  }
});

test('every guide in every language round-trips', () => {
  for (const { code } of LOCALES) {
    for (const g of GUIDES) {
      const path = pathFor('learn', g.slug, code);
      assert.deepEqual(parsePath(path), { page: 'learn', param: g.slug, lang: code });
    }
  }
});

test('home and Learn get a language prefix; app screens never do', () => {
  assert.equal(pathFor('splash', null, 'hi'), '/hi');
  assert.equal(pathFor('learn', null, 'ta'), '/ta/learn');
  assert.equal(pathFor('learn', 'sade-sati', 'te'), '/te/learn/sade-sati');
  assert.equal(pathFor('splash', null, 'en'), '/');
  for (const page of ['dashboard', 'kundli', 'settings', 'about']) assert.ok(!pathFor(page, null, 'hi').startsWith('/hi'), page);
  assert.deepEqual([...LOCALIZED_PAGES].sort(), ['learn', 'splash']);
});

test('unknown addresses become the 404 screen', () => {
  for (const p of ['/xyz', '/learnx', '/hi/chat', '/zz/learn', '/chat/extra']) assert.equal(parsePath(p).page, 'notfound', p);
  assert.equal(parsePath('/').page, 'splash');
  assert.deepEqual(parsePath('/hi/'), { page: 'splash', param: null, lang: 'hi' }, 'trailing slash on a language home');
});

test('trailing slashes are ignored', () => {
  assert.equal(parsePath('/learn/').page, 'learn');
  assert.equal(parsePath('/kundli/').page, 'kundli');
});

test('chat is open to guests; only purchases need an account', () => {
  assert.ok(!ACCOUNT_PAGES.has('dashboard'));
  assert.ok(ACCOUNT_PAGES.has('buy-tokens') && ACCOUNT_PAGES.has('premium'));
  for (const p of ['splash', 'auth', 'learn', 'notfound', ...INFO_PAGE_KEYS]) assert.ok(PUBLIC_PAGES.has(p), p);
});
