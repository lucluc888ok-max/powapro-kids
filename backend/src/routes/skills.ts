import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { parentAuth } from '../middleware/parentAuth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  try {
    const player = await prisma.player.findFirst();
    if (!player) { res.json([]); return; }
    const skills = await prisma.skill.findMany({
      where: { playerId: player.id },
      orderBy: [{ isGold: 'desc' }, { certifiedAt: 'asc' }],
    });
    res.json(skills);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post('/', parentAuth, async (req, res) => {
  try {
    const player = await prisma.player.findFirst();
    if (!player) { res.status(404).json({ error: 'プレイヤーが見つかりません' }); return; }
    const { name } = req.body as { name: string };
    if (!name?.trim()) { res.status(400).json({ error: 'スキル名を入力してください' }); return; }
    const skill = await prisma.skill.create({
      data: { playerId: player.id, name: name.trim() },
    });
    res.json(skill);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.put('/:id/gold', parentAuth, async (req, res) => {
  try {
    const skill = await prisma.skill.update({
      where: { id: Number(req.params.id) },
      data: { isGold: true },
    });
    res.json(skill);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.delete('/:id', parentAuth, async (req, res) => {
  try {
    await prisma.skill.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
