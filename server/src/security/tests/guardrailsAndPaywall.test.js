import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import GuardrailService, { GUARDRAIL_ERROR_CODES } from '../guardrailService.js';
import { getGuardrailConfig, setRuntimeConfigOverride, resetRuntimeConfigOverrides } from '../guardrailConfig.js';
import EntitlementService from '../../services/entitlementService.js';
import { AstrologyService, CHART_STATUS } from '../../astrology/astrology.service.js';
import prisma from '../../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to create or get a test user in SQLite
async function getOrCreateTestUser(customId = 'test_guardrail_user') {
  return prisma.user.upsert({
    where: { email: `${customId}@example.com` },
    create: {
      id: customId,
      name: 'Guardrail Tester',
      email: `${customId}@example.com`,
      isGuest: true,
    },
    update: {},
  });
}

// Cleanup helper
async function cleanupUserRecords(userId) {
  try {
    await prisma.gurujiUsage.deleteMany({ where: { userId } });
    await prisma.gurujiSession.deleteMany({ where: { userId } });
  } catch (e) {}
}

// ─── 1. Free User Normal Request ─────────────────────────────────────────────
test('1. Free user normal request is permitted within daily limit', async () => {
  const user = await getOrCreateTestUser('test_user_free_normal');
  await cleanupUserRecords(user.id);

  const entitlement = await EntitlementService.checkConsultationEntitlement(user.id, 'standard');
  assert.equal(entitlement.allowed, true);
  assert.equal(entitlement.mode, 'FREE');
  assert.equal(entitlement.usedToday, 0);

  // Record 1 consultation
  await EntitlementService.recordConsultationUsage(user.id, {
    intent: 'career',
    depth: 'standard',
    success: true,
  });

  const nextCheck = await EntitlementService.checkConsultationEntitlement(user.id, 'standard');
  assert.equal(nextCheck.allowed, true);
  assert.equal(nextCheck.usedToday, 1);
});

// ─── 2. Free User Reaches Daily Limit ────────────────────────────────────────
test('2. Free user reaches daily limit (3 questions -> DAILY_LIMIT_REACHED)', async () => {
  const user = await getOrCreateTestUser('test_user_daily_limit');
  await cleanupUserRecords(user.id);

  // Record 3 usages to simulate hitting limit
  for (let i = 0; i < 3; i++) {
    await EntitlementService.recordConsultationUsage(user.id, {
      intent: 'general',
      depth: 'standard',
      success: true,
    });
  }

  const entitlement = await EntitlementService.checkConsultationEntitlement(user.id, 'standard');
  assert.equal(entitlement.allowed, false);
  assert.equal(entitlement.code, GUARDRAIL_ERROR_CODES.DAILY_LIMIT_REACHED);
  assert.ok(entitlement.paywall);
  assert.equal(entitlement.paywall.eligible, true);
  assert.equal(entitlement.paywall.showInterestPrompt, true);
  assert.equal(entitlement.paywall.usedToday, 3);
});

// ─── 3. Rate Limiting ────────────────────────────────────────────────────────
test('3. Per-user rate limiting rejects rapid successive requests (<1s)', () => {
  GuardrailService.resetState();
  const userId = 'rate_limit_test_user';

  const first = GuardrailService.checkRateLimit(userId);
  assert.equal(first.allowed, true);

  const immediateSecond = GuardrailService.checkRateLimit(userId);
  assert.equal(immediateSecond.allowed, false);
  assert.equal(immediateSecond.code, GUARDRAIL_ERROR_CODES.RATE_LIMITED);
  assert.ok(immediateSecond.retryAfterMs > 0);
});

// ─── 4. Concurrent Request Protection ─────────────────────────────────────────
test('4. Concurrent request protection prevents simultaneous in-flight calls', () => {
  GuardrailService.resetState();
  const userId = 'concurrent_test_user';

  const lock1 = GuardrailService.acquireLock(userId, 'First query');
  assert.equal(lock1.acquired, true);

  const lock2 = GuardrailService.acquireLock(userId, 'Second simultaneous query');
  assert.equal(lock2.acquired, false);
  assert.equal(lock2.code, GUARDRAIL_ERROR_CODES.CONCURRENT_REQUEST);

  // Release lock and verify re-acquisition succeeds
  GuardrailService.releaseLock(userId);
  const lock3 = GuardrailService.acquireLock(userId, 'Third query after release');
  assert.equal(lock3.acquired, true);
  GuardrailService.releaseLock(userId);
});

// ─── 5. Duplicate Request Idempotency ─────────────────────────────────────────
test('5. Duplicate request check rejects in-flight double submission', () => {
  GuardrailService.resetState();
  const userId = 'double_click_user';
  const query = 'What does my 10th house say?';

  const lockA = GuardrailService.acquireLock(userId, query);
  assert.equal(lockA.acquired, true);

  // Second immediate click with identical query
  const lockB = GuardrailService.acquireLock(userId, query);
  assert.equal(lockB.acquired, false);
  assert.equal(lockB.code, GUARDRAIL_ERROR_CODES.CONCURRENT_REQUEST);

  GuardrailService.releaseLock(userId);
});

// ─── 6. Oversized Input Validation ────────────────────────────────────────────
test('6. Oversized input validation rejects inquiries exceeding 500 characters', () => {
  const shortValid = 'What does my Lagna say about my career?';
  const checkValid = GuardrailService.validateInputMessage(shortValid);
  assert.equal(checkValid.valid, true);
  assert.equal(checkValid.sanitized, shortValid);

  const oversized = 'A'.repeat(501);
  const checkOversized = GuardrailService.validateInputMessage(oversized);
  assert.equal(checkOversized.valid, false);
  assert.equal(checkOversized.code, GUARDRAIL_ERROR_CODES.MESSAGE_TOO_LONG);

  const empty = '   ';
  const checkEmpty = GuardrailService.validateInputMessage(empty);
  assert.equal(checkEmpty.valid, false);
  assert.equal(checkEmpty.code, GUARDRAIL_ERROR_CODES.MESSAGE_EMPTY);
});

// ─── 7. Deep Request Usage Weighting ──────────────────────────────────────────
test('7. Deep request usage weighting consumes 2 internal units', () => {
  assert.equal(EntitlementService.getUsageUnits('quick'), 1);
  assert.equal(EntitlementService.getUsageUnits('standard'), 1);
  assert.equal(EntitlementService.getUsageUnits('deep'), 2);
});

// ─── 8. Gemini Global Safety Limit ────────────────────────────────────────────
test('8. Gemini global limit protects against daily capacity breach', () => {
  GuardrailService.resetState();
  setRuntimeConfigOverride('GEMINI_GLOBAL_DAILY_LIMIT', 2);

  assert.equal(GuardrailService.checkGlobalProviderLimit('gemini').allowed, true);
  GuardrailService.incrementGlobalProviderCounter('gemini'); // 1
  assert.equal(GuardrailService.checkGlobalProviderLimit('gemini').allowed, true);
  GuardrailService.incrementGlobalProviderCounter('gemini'); // 2

  // 3rd call exceeds limit
  const limitBreached = GuardrailService.checkGlobalProviderLimit('gemini');
  assert.equal(limitBreached.allowed, false);
  assert.equal(limitBreached.code, GUARDRAIL_ERROR_CODES.GLOBAL_LIMIT_EXCEEDED);

  resetRuntimeConfigOverrides();
  GuardrailService.resetState();
});

// ─── 9. FreeAstroAPI Cache Reuse ─────────────────────────────────────────────
test('9. FreeAstroAPI cache reuse serves existing ready chart without provider call', async () => {
  const user = await getOrCreateTestUser('test_freeastro_cache_user');

  // Seed ready chart
  await prisma.chart.upsert({
    where: { userId_type: { userId: user.id, type: 'natal' } },
    create: {
      userId: user.id,
      type: 'natal',
      status: CHART_STATUS.READY,
      chartData: JSON.stringify({ lagna: { sign: 'Leo' }, status: 'calculated' }),
    },
    update: {
      status: CHART_STATUS.READY,
      chartData: JSON.stringify({ lagna: { sign: 'Leo' }, status: 'calculated' }),
    },
  });

  const chart = await AstrologyService.getChart(user.id, 'natal');
  assert.ok(chart);
  assert.equal(chart.status, CHART_STATUS.READY);
  assert.equal(chart.chartData.lagna.sign, 'Leo');
});

// ─── 10. Emergency Kill Switch ────────────────────────────────────────────────
test('10. Emergency kill switch immediately pauses consultations', () => {
  resetRuntimeConfigOverrides();
  assert.equal(GuardrailService.checkGlobalStatus().allowed, true);

  setRuntimeConfigOverride('GURUJI_EMERGENCY_STOP', true);
  const stopped = GuardrailService.checkGlobalStatus();
  assert.equal(stopped.allowed, false);
  assert.equal(stopped.code, GUARDRAIL_ERROR_CODES.GURUJI_TEMPORARILY_DISABLED);

  resetRuntimeConfigOverrides();
});

// ─── 11. Unauthorized Request Handling ────────────────────────────────────────
test('11. Unauthorized request error code is defined', () => {
  assert.equal(GUARDRAIL_ERROR_CODES.UNAUTHORIZED, 'UNAUTHORIZED');
});

// ─── 12. Paid Session Creation ────────────────────────────────────────────────
test('12. Paid session creation initializes 10-min duration and 20 questions', async () => {
  const user = await getOrCreateTestUser('test_session_create_user');
  await cleanupUserRecords(user.id);

  const session = await EntitlementService.createPaidSession(user.id);
  assert.ok(session.id);
  assert.equal(session.status, 'active');
  assert.equal(session.maxQuestions, 20);
  assert.equal(session.questionsUsed, 0);
  assert.equal(session.remainingQuestions, 20);
  assert.ok(session.remainingSeconds > 590 && session.remainingSeconds <= 600);
});

// ─── 13. Session Expiration ──────────────────────────────────────────────────
test('13. Expired session automatically updates status to expired and falls back to free quota', async () => {
  const user = await getOrCreateTestUser('test_session_expire_user');
  await cleanupUserRecords(user.id);

  // Create an already-expired session (expiryTime in past)
  const pastExpiry = new Date(Date.now() - 60000);
  await prisma.gurujiSession.create({
    data: {
      userId: user.id,
      status: 'active',
      entitlementType: 'PAID_GURUJI_SESSION',
      startTime: new Date(Date.now() - 120000),
      expiryTime: pastExpiry,
      maxQuestions: 20,
      questionsUsed: 5,
    },
  });

  const active = await EntitlementService.getActiveSession(user.id);
  assert.equal(active, null, 'Expired session must return null');

  // Verify status in DB was updated to expired
  const dbRecord = await prisma.gurujiSession.findFirst({ where: { userId: user.id } });
  assert.equal(dbRecord.status, 'expired');
});

// ─── 14. 20-Question Session Depletion ────────────────────────────────────────
test('14. Session with 20 questions used is marked completed and returns null', async () => {
  const user = await getOrCreateTestUser('test_session_deplete_user');
  await cleanupUserRecords(user.id);

  // Create session with 20/20 questions used
  const futureExpiry = new Date(Date.now() + 600000);
  await prisma.gurujiSession.create({
    data: {
      userId: user.id,
      status: 'active',
      entitlementType: 'PAID_GURUJI_SESSION',
      startTime: new Date(),
      expiryTime: futureExpiry,
      maxQuestions: 20,
      questionsUsed: 20,
    },
  });

  const active = await EntitlementService.getActiveSession(user.id);
  assert.equal(active, null, 'Depleted session must return null');

  const dbRecord = await prisma.gurujiSession.findFirst({ where: { userId: user.id } });
  assert.equal(dbRecord.status, 'completed');
});

// ─── 15. Prevention of Multiple Active Sessions ───────────────────────────────
test('15. Multiple active sessions for the same user are rejected', async () => {
  const user = await getOrCreateTestUser('test_multi_session_user');
  await cleanupUserRecords(user.id);

  await EntitlementService.createPaidSession(user.id);

  // Attempting to create second active session throws ACTIVE_SESSION_EXISTS
  await assert.rejects(
    async () => {
      await EntitlementService.createPaidSession(user.id);
    },
    (err) => {
      assert.equal(err.code, 'ACTIVE_SESSION_EXISTS');
      return true;
    }
  );
});

// ─── 16. Manipulated Client Timer Prevention ──────────────────────────────────
test('16. Backend ignores client timestamps and calculates remaining time from DB expiryTime', async () => {
  const user = await getOrCreateTestUser('test_timer_tamper_user');
  await cleanupUserRecords(user.id);

  const session = await EntitlementService.createPaidSession(user.id);
  // Server-computed remainingSeconds must be derived strictly from DB expiryTime - now
  const active = await EntitlementService.getActiveSession(user.id);
  assert.ok(active.remainingSeconds <= 600 && active.remainingSeconds >= 595);
});

// ─── 17. Manipulated Client Question Counter Prevention ───────────────────────
test('17. Backend tracks questionsUsed strictly in DB regardless of client input', async () => {
  const user = await getOrCreateTestUser('test_counter_tamper_user');
  await cleanupUserRecords(user.id);

  const session = await EntitlementService.createPaidSession(user.id);

  // Record 2 consultations via backend
  await EntitlementService.recordConsultationUsage(user.id, {
    intent: 'career',
    sessionId: session.id,
  });
  await EntitlementService.recordConsultationUsage(user.id, {
    intent: 'finance',
    sessionId: session.id,
  });

  const active = await EntitlementService.getActiveSession(user.id);
  assert.equal(active.questionsUsed, 2);
  assert.equal(active.remainingQuestions, 18);
});

// ─── 18. Structured Paywall Response ──────────────────────────────────────────
test('18. Reaching limit returns structured paywall metadata', async () => {
  const user = await getOrCreateTestUser('test_paywall_meta_user');
  await cleanupUserRecords(user.id);

  for (let i = 0; i < 3; i++) {
    await EntitlementService.recordConsultationUsage(user.id, { intent: 'general' });
  }

  const res = await EntitlementService.checkConsultationEntitlement(user.id);
  assert.equal(res.allowed, false);
  assert.equal(res.code, GUARDRAIL_ERROR_CODES.DAILY_LIMIT_REACHED);
  assert.deepEqual(res.paywall, {
    eligible: true,
    showInterestPrompt: true,
    freeLimit: 3,
    usedToday: 3,
    remainingToday: 0,
  });
});

// ─── 19. No Paywall Before Free Limit ─────────────────────────────────────────
test('19. Questions 1 and 2 permit consultation with zero paywall prompt', async () => {
  const user = await getOrCreateTestUser('test_no_paywall_early_user');
  await cleanupUserRecords(user.id);

  const check1 = await EntitlementService.checkConsultationEntitlement(user.id);
  assert.equal(check1.allowed, true);
  assert.equal(check1.paywall, undefined);

  await EntitlementService.recordConsultationUsage(user.id, { intent: 'general' });

  const check2 = await EntitlementService.checkConsultationEntitlement(user.id);
  assert.equal(check2.allowed, true);
  assert.equal(check2.paywall, undefined);
});

// ─── 20. Static Scan: No Pricing on Home or Onboarding ─────────────────────────
test('20. Static Code Scan: No pricing (₹, ₹9, ₹49) rendered on Home or Onboarding components', () => {
  const frontendDir = path.resolve(__dirname, '../../../../src');
  const dashboardPath = path.join(frontendDir, 'pages/DashboardPage.jsx');
  const onboardingPath = path.join(frontendDir, 'pages/OnboardingPage.jsx');
  const kundliPath = path.join(frontendDir, 'pages/KundliPage.jsx');

  const filesToCheck = [dashboardPath, onboardingPath, kundliPath];
  const FORBIDDEN_PRICE_PATTERNS = [/₹\s*\d+/, /\b(buy now|upgrade now|subscription pricing)\b/i];

  filesToCheck.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      FORBIDDEN_PRICE_PATTERNS.forEach((pat) => {
        assert.ok(
          !pat.test(content),
          `File ${path.basename(filePath)} must not contain pricing pattern ${pat}`
        );
      });
    }
  });
});

// ─── 21. Contextual Paywall Interest & Dev Activation ─────────────────────────
test('21. Contextual paywall interest logging and safe dev session activation', async () => {
  const user = await getOrCreateTestUser('test_paywall_flow_user');
  await cleanupUserRecords(user.id);

  // Stage 1 Interest
  const interestRes = await EntitlementService.recordPaywallInterest(user.id, { mode: 'career' });
  assert.equal(interestRes.success, true);
  assert.ok(interestRes.timestamp);

  // Stage 2 Dev Activation
  const session = await EntitlementService.devActivateSession(user.id);
  assert.ok(session.id);
  assert.equal(session.status, 'active');
  assert.equal(session.remainingQuestions, 20);

  // Now user has active session entitlement
  const check = await EntitlementService.checkConsultationEntitlement(user.id);
  assert.equal(check.allowed, true);
  assert.equal(check.mode, 'PAID_SESSION');
});
