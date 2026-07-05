import express from 'express';
import cors from 'cors';
import playerRouter from './routes/player';
import trainingRouter from './routes/training';
import approvalRouter from './routes/approval';
import skillsRouter from './routes/skills';
import historyRouter from './routes/history';
import menuScheduleRouter from './routes/menuSchedule';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/player', playerRouter);
app.use('/api/training', trainingRouter);
app.use('/api/approval', approvalRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/history', historyRouter);
app.use('/api/menu-schedule', menuScheduleRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
