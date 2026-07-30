import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import MemoryService from '../services/memoryService.js';

const router = Router();
router.use(requireAuth);

// ─── GET /api/settings ────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const preferences = await MemoryService.getOrCreatePreference(req.userId);
    res.json({
      theme: 'dark',
      notifications: true,
      preferences: {
        personality: preferences.personality,
        language: preferences.language,
        communicationStyle: preferences.communicationStyle,
        goals: preferences.goals ? preferences.goals.split(',') : [],
        importantQuestions: preferences.importantQuestions ? preferences.importantQuestions.split(',') : [],
        summaries: preferences.summaries,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/settings ────────────────────────────────────────────────────────
router.put('/', async (req, res, next) => {
  try {
    const { personality, language, communicationStyle, goals, importantQuestions } = req.body;

    const updated = await MemoryService.updatePreference(req.userId, {
      personality,
      language,
      communicationStyle,
      goals,
      importantQuestions,
    });

    res.json({
      success: true,
      preferences: {
        personality: updated.personality,
        language: updated.language,
        communicationStyle: updated.communicationStyle,
        goals: updated.goals ? updated.goals.split(',') : [],
        importantQuestions: updated.importantQuestions ? updated.importantQuestions.split(',') : [],
        summaries: updated.summaries,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
