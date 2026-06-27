import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/menus', async (_req, res) => {
  try {
    const menus = await prisma.trainingMenu.findMany({ where: { isActive: true } });
    res.json(menus);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post('/log', async (req, res) => {
  try {
    const player = await prisma.player.findFirst();
    if (!player) { res.status(404).json({ error: 'プレイヤーが見つかりません' }); return; }

    const { menuIds } = req.body as { menuIds: number[] };
    if (!menuIds?.length) { res.status(400).json({ error: '練習メニューを選択してください' }); return; }

    // 当日の記録が既にあるか確認
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await prisma.trainingLog.findFirst({
      where: { playerId: player.id, date: { gte: today, lt: tomorrow } },
    });
    if (existing) { res.status(409).json({ error: '今日の練習記録は既に提出済みです' }); return; }

    const menus = await prisma.trainingMenu.findMany({ where: { id: { in: menuIds }, isActive: true } });
    const statsDelta: Record<string, number> = {};
    for (const m of menus) {
      statsDelta[m.targetStat] = (statsDelta[m.targetStat] || 0) + m.deltaValue;
    }

    const log = await prisma.trainingLog.create({
      data: {
        playerId: player.id,
        date: new Date(),
        menus: menus.map(m => ({ id: m.id, name: m.name, targetStat: m.targetStat })),
        statsDelta,
      },
    });
    res.json(log);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get('/pending', async (_req, res) => {
  try {
    const player = await prisma.player.findFirst();
    if (!player) { res.json([]); return; }
    const logs = await prisma.trainingLog.findMany({
      where: { playerId: player.id, approved: false, rejected: false },
      orderBy: { date: 'desc' },
    });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
