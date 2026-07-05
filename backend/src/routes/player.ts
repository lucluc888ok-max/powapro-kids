import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { parentAuth } from '../middleware/parentAuth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  try {
    let player = await prisma.player.findFirst();
    if (!player) {
      player = await prisma.player.create({
        data: {
          name: 'こんどう', number: 7, position: 'ガード',
          playStyle: 'ドリブラー', height: 148, weight: 38,
        },
      });
    }
    res.json(player);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.put('/', async (req, res) => {
  try {
    const player = await prisma.player.findFirst();
    if (!player) { res.status(404).json({ error: 'プレイヤーが見つかりません' }); return; }
    const { name, number, position, playStyle, height, weight } = req.body;
    const updated = await prisma.player.update({
      where: { id: player.id },
      data: { name, number, position, playStyle, height, weight },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.put('/stats', parentAuth, async (req, res) => {
  try {
    const player = await prisma.player.findFirst();
    if (!player) { res.status(404).json({ error: 'プレイヤーが見つかりません' }); return; }
    const { gamesPlayed, totalPoints, totalAssists } = req.body;
    const updated = await prisma.player.update({
      where: { id: player.id },
      data: { gamesPlayed, totalPoints, totalAssists },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
