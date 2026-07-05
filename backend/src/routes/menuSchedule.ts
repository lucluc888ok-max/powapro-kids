import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { parentAuth } from '../middleware/parentAuth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  try {
    let schedule = await prisma.menuSchedule.findUnique({ where: { id: 1 } });
    if (!schedule) {
      schedule = await prisma.menuSchedule.create({ data: { id: 1 } });
    }
    res.json(schedule);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.put('/', parentAuth, async (req, res) => {
  try {
    const { monGroup, tueGroup, wedGroup, thuGroup, friGroup, satGroup, sunGroup, teamDays } = req.body;
    const schedule = await prisma.menuSchedule.upsert({
      where: { id: 1 },
      create: { id: 1, monGroup, tueGroup, wedGroup, thuGroup, friGroup, satGroup, sunGroup, teamDays },
      update: { monGroup, tueGroup, wedGroup, thuGroup, friGroup, satGroup, sunGroup, teamDays },
    });
    res.json(schedule);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
