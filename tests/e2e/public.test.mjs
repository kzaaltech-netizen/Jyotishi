// A visitor who is not signed in: home, Learn, languages, policy pages, 404, theme.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { visitor, open, pathOf, h1, noErrors, closeBrowser } from './helpers.mjs';

after(closeBrowser);

test('home page: headline, ask box, starters, demo, FAQ', async () => {
  const { page, errors, close } = await visitor();
  await open(page, '/');
  assert.equal(await h1(page), 'Your Kundli, one message away.');
  assert.match(await page.title(), /Jyotishly/);
  assert.ok(await page.locator('#ask-lg').isVisible());
  assert.equal(await page.locator('form + div button.chip').count(), 4, 'four starter questions');
  const faq = page.locator('details').first();
  await faq.locator('summary').click();
  assert.equal(await faq.getAttribute('open'), '', 'FAQ opens');
  assert.equal(await page.locator('section[aria-labelledby=learn-heading] li').count(), 6, 'six featured guides');
  noErrors(errors, 'home');
  await close();
});

test('asking on the home page opens the chat with the question kept', async () => {
  const { page, errors, close } = await visitor();
  await open(page, '/');
  await page.fill('#ask-lg', 'Will I get a job this year?');
  await page.press('#ask-lg', 'Enter');
  await page.waitForSelector('#co-name');
  assert.equal(pathOf(page), '/chat');
  assert.ok(await page.getByText('Will I get a job this year?').first().isVisible(), 'question shown in the chat');
  noErrors(errors, 'ask');
  await close();
});

test('an empty question still opens the chat', async () => {
  const { page, close } = await visitor();
  await open(page, '/');
  await page.locator('form button[type=submit]').first().click();
  await page.waitForSelector('#co-name');
  assert.equal(pathOf(page), '/chat');
  await close();
});

test('Learn: index lists every guide; a guide has short answer, FAQ, sources and related links', async () => {
  const { page, errors, close } = await visitor();
  await open(page, '/learn');
  assert.equal(await page.locator('main a[href^="/learn/"]').count(), 15);
  await page.locator('main a[href="/learn/sade-sati"]').first().click();
  await page.waitForURL('**/learn/sade-sati');
  assert.equal(await h1(page), 'What is Sade Sati?');
  assert.ok(await page.locator('section[aria-label="Short answer"]').isVisible());
  assert.ok((await page.locator('#guide-sources + ul a').count()) >= 2);
  for (const a of await page.locator('#guide-sources + ul a').all()) {
    assert.equal(await a.getAttribute('target'), '_blank');
    assert.match(await a.getAttribute('rel'), /noopener/);
  }
  await page.locator('nav[aria-labelledby=related-heading] a').first().click();
  await page.waitForURL((u) => u.pathname.startsWith('/learn/') && !u.pathname.endsWith('sade-sati'));
  await page.goBack();
  await page.waitForURL('**/learn/sade-sati');
  assert.equal(await h1(page), 'What is Sade Sati?', 'back button restores the guide');
  noErrors(errors, 'learn');
  await close();
});

test('"Ask about mine" on a guide opens the chat with that question', async () => {
  const { page, close } = await visitor();
  await open(page, '/learn/what-is-lagna');
  await page.getByRole('button', { name: 'Ask about mine' }).click();
  await page.waitForSelector('#co-name');
  assert.ok(await page.getByText('What does my Lagna say about me').first().isVisible());
  await close();
});

test('language switcher moves to the same page in another language and back', async () => {
  const { page, errors, close } = await visitor();
  await open(page, '/learn/mangal-dosha');
  await page.selectOption('#site-lang', 'hi');
  await page.waitForURL('**/hi/learn/mangal-dosha');
  assert.equal(await h1(page), 'मांगलिक दोष क्या है?');
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'hi-IN');
  await page.selectOption('#site-lang', 'te');
  await page.waitForURL('**/te/learn/mangal-dosha');
  await page.goBack();
  await page.waitForURL('**/hi/learn/mangal-dosha');
  assert.equal(await h1(page), 'मांगलिक दोष क्या है?');
  noErrors(errors, 'languages');
  await close();
});

test('every language home page renders in its own script', async () => {
  const expected = { hi: 'आपकी कुंडली', mr: 'तुमची कुंडली', bn: 'আপনার কুষ্ঠি', ta: 'உங்கள் ஜாதகம்', te: 'మీ జాతకం' };
  const { page, errors, close } = await visitor();
  for (const [code, text] of Object.entries(expected)) {
    await open(page, `/${code}`);
    assert.ok((await h1(page)).startsWith(text), `${code}: ${await h1(page)}`);
  }
  noErrors(errors, 'language homes');
  await close();
});

test('a Hindi browser is offered Hindi, and the offer can be dismissed for good', async () => {
  const { page, close } = await visitor({ locale: 'hi-IN' });
  await open(page, '/');
  const bar = page.getByRole('button', { name: 'हिन्दी में पढ़ें' });
  assert.ok(await bar.isVisible(), 'suggestion shown');
  await page.getByRole('button', { name: 'नहीं, धन्यवाद' }).click();
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await bar.count(), 0, 'stays dismissed');
  await close();
});

test('policy pages and contact details', async () => {
  const { page, errors, close } = await visitor();
  for (const [path, title] of [['/about', 'About Jyotishly'], ['/contact', 'Contact us'], ['/privacy', 'Privacy policy'], ['/terms', 'Terms of use']]) {
    await open(page, path);
    assert.equal(await h1(page), title);
  }
  await open(page, '/contact');
  assert.ok(await page.locator('a[href="mailto:kzaaltech@gmail.com"]').first().isVisible());
  await open(page, '/');
  for (const label of ['About', 'Contact', 'Privacy policy', 'Terms of use']) assert.ok(await page.locator('footer').getByText(label).isVisible(), `footer ${label}`);
  noErrors(errors, 'policy');
  await close();
});

test('unknown addresses show the 404 page with ways back', async () => {
  const { page, close } = await visitor();
  for (const path of ['/this-does-not-exist', '/hi/nothing-here']) {
    await open(page, path);
    assert.equal(await h1(page), 'This page is not in the stars');
    assert.equal(pathOf(page), path, 'address kept');
  }
  // The 404 keeps the visitor's language: Home leads to the Hindi home page.
  await page.locator('main a').first().click();
  await page.waitForURL((u) => u.pathname === '/hi');
  await close();
});

test('theme toggle switches and is remembered', async () => {
  const { page, close } = await visitor();
  await open(page, '/');
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.locator('header button[aria-label^="Switch to"]').click();
  const after = await page.evaluate(() => document.documentElement.dataset.theme);
  assert.notEqual(after, before);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), after);
  await close();
});

test('skip link moves keyboard focus to the main content', async () => {
  const { page, close } = await visitor();
  await open(page, '/learn');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  assert.equal(focused, 'Skip to content');
  await close();
});
