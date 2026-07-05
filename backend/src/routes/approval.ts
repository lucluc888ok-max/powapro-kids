import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parentAuth } from '../middleware/parentAuth';

const router = Router();
const prisma = new PrismaClient();

const STATS = ['handling', 'physical', 'speed', 'shooting', 'defense', 'passing', 'mental'] as const;
type StatKey = typeof STATS[number];

router.post('/login', async (req, res) => {
  const { password } = req.body as { password: string };
  const raw = process.env.PARENT_PASSWORD || '1234';

  let match = false;
  if (raw.startsWith('$2')) {
    match = await bcrypt.compare(password, raw);
  } else {
    match = password === raw;
  }

  if (!match) { res.status(401).json({ error: 'パスワードが違います' }); return; }

  const token = jwt.sign({ role: 'parent' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.json({ token });
});

router.post('/approve/:id', parentAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const log = await prisma.trainingLog.findUnique({ where: { id } });
    if (!log) { res.status(404).json({ error: '記録が見つかりません' }); return; }
    if (log.approved || log.rejected) { res.status(409).json({ error: '既に処理済みです' }); return; }

    const delta = JSON.parse(log.statsDelta) as Record<string, number>;
    const player = await prisma.player.findUnique({ where: { id: log.playerId } });
    if (!player) { res.status(404).json({ error: 'プレイヤーが見つかりません' }); return; }

    const update: Partial<Record<StatKey, number>> = {};
    for (const key of STATS) {
      if (delta[key]) {
        update[key] = Math.min(999, player[key] + delta[key]);
      }
    }

    await prisma.$transaction([
      prisma.trainingLog.update({
        where: { id }, data: { approved: true, approvedAt: new Date() },
      }),
      prisma.player.update({ where: { id: player.id }, data: update }),
    ]);

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post('/reject/:id', parentAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const log = await prisma.trainingLog.findUnique({ where: { id } });
    if (!log) { res.status(404).json({ error: '記録が見つかりません' }); return; }
    if (log.approved || log.rejected) { res.status(409).json({ error: '既に処理済みです' }); return; }

    await prisma.trainingLog.update({ where: { id }, data: { rejected: true } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
