// Full user stories in a real browser, as people actually use the site.
// The account story makes one real AI call (Gemini), so it takes a minute or two.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { visitor, open, pathOf, h1, noErrors, closeBrowser, unique, PASSWORD, makeChartInChat, apiDelete, waitForH1, waitForReply } from './helpers.mjs';

after(closeBrowser);

const QUESTION = 'Is this a good year to change jobs?';

test('new visitor: asks on home → gives birth details → signs up → gets an answer → manages the account', async (t) => {
  const { page, errors, close } = await visitor();
  const email = unique();
  let token;
  try {
    // 1. Ask on the home page.
    await open(page, '/');
    await page.fill('#ask-lg', QUESTION);
    await page.press('#ask-lg', 'Enter');

    // 2. Birth details inside the chat, chart is calculated.
    await makeChartInChat(page);
    assert.equal(pathOf(page), '/chat');
    await page.waitForFunction((q) => document.querySelector('textarea')?.value === q, QUESTION, { timeout: 10_000 });

    // 3. Sending asks for an account; the question is kept.
    await page.locator('button[aria-label="Send"]').click();
    await page.waitForURL('**/login');
    await waitForH1(page, 'Create your account');
    assert.ok(await page.getByText(QUESTION).isVisible(), 'question shown on sign-up');

    // Form validation before submitting.
    await page.locator('form button[type=submit]').click();
    assert.ok(await page.locator('[role=alert]').isVisible(), 'empty form is refused');

    await page.fill('#auth-name', 'Asha Verma');
    await page.fill('#auth-email', email);
    await page.fill('#auth-password', PASSWORD);
    await page.locator('form button[type=submit]').click();

    // 4. Back in the chat, the question is sent and the guide answers.
    await page.waitForURL('**/chat');
    token = await page.evaluate(() => localStorage.getItem('aj_token'));
    const answered = await waitForReply(page);
    if (answered) {
      assert.ok(await page.getByText(QUESTION).first().isVisible(), 'question in the conversation');
      const reply = await page.locator('main .space-y-3').last().innerText();
      assert.ok(reply.trim().length > 20, `guide replied: ${reply.slice(0, 80)}`);
      // 5. The conversation survives a reload.
      await page.reload({ waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Copy' }).first().waitFor({ timeout: 30_000 });
    } else {
      // The AI service (Gemini) was overloaded for every retry: the app showed the
      // busy notice instead of failing, which is the behaviour under test here.
      t.diagnostic('AI provider unavailable during this run; reply checks skipped');
      assert.equal(await page.inputValue('textarea'), QUESTION, 'question returned to the box for a retry');
    }

    // 6. Switch guide.
    await page.locator('header button[aria-haspopup=listbox]').click();
    await page.getByRole('option', { name: /Bhrigu/ }).click();
    assert.ok(await page.locator('header').getByText('Bhrigu').first().isVisible());

    // 7. Kundli and Today work for the account.
    await open(page, '/kundli');
    await waitForH1(page, /Asha Verma’s chart/);
    await open(page, '/today');
    await waitForH1(page, 'Your day, from your chart');

    // 8. Buying tokens says payments are not open yet (no gateway).
    await open(page, '/wallet/buy');
    await page.getByRole('button', { name: 'Get tokens' }).first().click();
    await page.locator('[role=alert]').getByText(/Payments are not open yet/).waitFor({ timeout: 30_000 });

    // 9. Change the app language, then back.
    await open(page, '/settings');
    await page.getByRole('button', { name: 'हिन्दी' }).click();
    await waitForH1(page, 'पसंद');
    assert.ok(await page.locator('aside nav').getByText('परामर्श').isVisible());
    await page.getByRole('button', { name: 'English' }).click();
    await waitForH1(page, 'Preferences');

    // 10. Sign out, sign back in, conversation is still there.
    await open(page, '/profile');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL((u) => u.pathname === '/');
    assert.equal(await page.evaluate(() => localStorage.getItem('aj_token')), null, 'token cleared');
    await open(page, '/login');
    await page.fill('#auth-email', email);
    await page.fill('#auth-password', 'wrong-password');
    await page.locator('form button[type=submit]').click();
    await page.locator('[role=alert]').waitFor({ timeout: 30_000 }); // wrong password shows an error
    await page.fill('#auth-password', PASSWORD);
    await page.locator('form button[type=submit]').click();
    await page.waitForURL('**/chat');
    if (answered) await page.getByRole('button', { name: 'Copy' }).first().waitFor({ timeout: 30_000 });

    // 11. Delete the account from Settings.
    await open(page, '/settings');
    await page.getByRole('button', { name: 'Delete my account' }).click();
    await page.fill('#delete-password', 'wrong-password');
    await page.getByRole('button', { name: 'Delete permanently' }).click();
    await page.locator('[role=alert]').getByText('That password is not correct.').waitFor({ timeout: 30_000 });
    await page.fill('#delete-password', PASSWORD);
    await page.getByRole('button', { name: 'Delete permanently' }).click();
    await page.waitForURL((u) => u.pathname === '/');
    token = null;

    // The account is gone.
    await open(page, '/login');
    await page.fill('#auth-email', email);
    await page.fill('#auth-password', PASSWORD);
    await page.locator('form button[type=submit]').click();
    await page.locator('[role=alert]').waitFor({ timeout: 30_000 }); // deleted account cannot sign in

    noErrors(errors, 'account journey');
  } finally {
    if (token) await apiDelete(token, PASSWORD);
    await close();
  }
});

test('guest: makes a Kundli without an account, explores it, then deletes it', async () => {
  const { page, errors, close } = await visitor();
  try {
    await open(page, '/kundli');
    await waitForH1(page, 'Your birth chart');
    await page.getByRole('button', { name: 'Add birth details' }).click();
    await page.waitForURL('**/start');

    // Stepper: name → date & time → place.
    await page.getByRole('button', { name: 'Continue' }).click();
    assert.ok(await page.locator('[role=alert]').isVisible(), 'name is required');
    await page.fill('#ob-name', 'Ravi Kumar');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.fill('#ob-dob', '1988-11-02');
    await page.fill('#ob-time', '21:15');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.fill('#ob-place', 'Chennai');
    await page.locator('[aria-label="Matching places"] button').first().click({ timeout: 8000 }).catch(() => {});
    await page.getByRole('button', { name: 'Calculate my chart' }).click();
    await page.getByRole('button', { name: 'See your Kundli' }).waitFor({ timeout: 120_000 });
    await waitForH1(page, 'Namaste, Ravi');
    await page.getByRole('button', { name: 'See your Kundli' }).click();

    await page.waitForURL('**/kundli');
    await waitForH1(page, /Ravi Kumar’s chart/);
    await page.getByRole('tab', { name: 'Planets', exact: true }).click();
    await page.locator('table tbody tr').first().waitFor();
    assert.equal(await page.locator('table tbody tr').count(), 9, 'nine planets');
    await page.locator('table tbody tr th button').first().click();
    assert.ok(await page.getByRole('dialog').isVisible(), 'planet details open');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'detached', timeout: 5000 });
    await page.getByRole('tab', { name: 'Dasha', exact: true }).click();
    await page.getByText('Mahadasha sequence').waitFor();

    await open(page, '/today');
    await waitForH1(page, 'Your day, from your chart');
    await open(page, '/profile');
    assert.ok(await page.getByText(/Guest — your chart is kept on this device/).isVisible());

    await open(page, '/settings');
    await page.getByRole('button', { name: 'Delete my guest data' }).click();
    await page.getByRole('button', { name: 'Delete permanently' }).click();
    await page.waitForURL((u) => u.pathname === '/');
    noErrors(errors, 'guest journey');
  } finally {
    await close();
  }
});
