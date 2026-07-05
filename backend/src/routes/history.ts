import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  try {
    const player = await prisma.player.findFirst();
    if (!player) { res.json([]); return; }
    const logs = await prisma.trainingLog.findMany({
      where: { playerId: player.id },
      orderBy: { date: 'desc' },
    });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get('/:date', async (req, res) => {
  try {
    const player = await prisma.player.findFirst();
    if (!player) { res.json(null); return; }
    const date = new Date(req.params.date);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const log = await prisma.trainingLog.findFirst({
      where: { playerId: player.id, date: { gte: date, lt: next } },
    });
    res.json(log ?? null);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
