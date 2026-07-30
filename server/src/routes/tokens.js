import { Router } from 'express';
import prisma from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const TOKEN_COSTS = {
  generate_chart:    5,
  generate_analysis: 3,
  chat_message:      1,
  deep_analysis:     5,
  chart_rerun:       3,
};

async function getWallet(userId) {
  let wallet = await prisma.tokenWallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.tokenWallet.create({ data: { userId, balance: 50 } });
  }
  return wallet;
}

// ─── GET /api/tokens ──────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const wallet = await getWallet(req.userId);

    const ledger = await prisma.tokenLedger.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayUsed = ledger
      .filter(e => e.cost > 0 && new Date(e.createdAt) >= todayStart)
      .reduce((s, e) => s + e.cost, 0);
    const totalUsed = ledger.filter(e => e.cost > 0).reduce((s, e) => s + e.cost, 0);

    res.json({ balance: wallet.balance, ledger, todayUsed, totalUsed });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/tokens/deduct ──────────────────────────────────────────────────
router.post('/deduct', async (req, res, next) => {
  try {
    const { action, description = '' } = req.body;
    if (!action || typeof action !== 'string') {
      return res.status(400).json({ error: 'Action is required.' });
    }

    const cost = TOKEN_COSTS[action] ?? 1;

    const wallet = await getWallet(req.userId);
    if (wallet.balance < cost) {
      return res.status(402).json({ error: 'Insufficient token balance.' });
    }

    const newBalance = wallet.balance - cost;
    const cleanDesc = typeof description === 'string' ? description.slice(0, 200) : '';

    await prisma.$transaction([
      prisma.tokenWallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.tokenLedger.create({
        data: {
          walletId: wallet.id,
          action: action.slice(0, 50),
          description: cleanDesc,
          cost,
          balance: newBalance,
        },
      }),
    ]);

    res.json({ success: true, newBalance, cost });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/tokens/add ─────────────────────────────────────────────────────
router.post('/add', async (req, res, next) => {
  try {
    const { amount, packName = 'purchase', price = 0 } = req.body;

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 100000) {
      return res.status(400).json({ error: 'amount must be a positive integer between 1 and 100,000.' });
    }

    const parsedPrice = parseInt(price, 10);
    const cleanPrice = (!isNaN(parsedPrice) && parsedPrice >= 0) ? parsedPrice : 0;
    const cleanPackName = (typeof packName === 'string' && packName.trim()) ? packName.trim().slice(0, 100) : 'purchase';

    const wallet = await getWallet(req.userId);
    const newBalance = wallet.balance + parsedAmount;

    await prisma.$transaction([
      prisma.tokenWallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.tokenLedger.create({
        data: {
          walletId: wallet.id,
          action: 'purchase',
          description: `Purchased ${cleanPackName}`,
          cost: -parsedAmount,
          balance: newBalance,
        },
      }),
      prisma.purchase.create({
        data: {
          userId: req.userId,
          packName: cleanPackName,
          tokensAdded: parsedAmount,
          price: cleanPrice,
        },
      }),
    ]);

    res.json({ success: true, newBalance });
  } catch (err) {
    next(err);
  }
});

export default router;
