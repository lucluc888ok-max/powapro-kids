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
    const { gamesPlayed, totalPoints, totalAssists, handling, physical, speed, shooting, defense, passing, mental } = req.body;
    const clamp = (v: unknown) => v !== undefined ? Math.min(999, Math.max(0, Number(v))) : undefined;
    const data: Record<string, number> = {};
    if (gamesPlayed !== undefined) data.gamesPlayed = Number(gamesPlayed);
    if (totalPoints !== undefined) data.totalPoints = Number(totalPoints);
    if (totalAssists !== undefined) data.totalAssists = Number(totalAssists);
    const c = { handling: clamp(handling), physical: clamp(physical), speed: clamp(speed), shooting: clamp(shooting), defense: clamp(defense), passing: clamp(passing), mental: clamp(mental) };
    for (const [k, v] of Object.entries(c)) if (v !== undefined) data[k] = v;
    const updated = await prisma.player.update({ where: { id: player.id }, data });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
