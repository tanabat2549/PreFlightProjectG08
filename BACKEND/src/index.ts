import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import siemseeRouter from './routes/siemseebackend.js';
import authRouter from './routes/LoginBackend.js';
// 🟢 1. Import Router ดวงและปฏิทินกลับเข้ามา
import horoscopeRouter from './routes/horoscopebackend.js';
import calendarRouter from './routes/calendarbackend.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://fsg08.cpecmu.com',
  process.env.CORS_ORIGIN
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// 🟢 2. เรียกใช้งาน Routes ให้ครบ
app.use('/api/siemsee', siemseeRouter);
app.use('/api', authRouter);
app.use('/api/horoscope', horoscopeRouter);
app.use('/api/calendar', calendarRouter);

app.get('/health', (req, res) => {
  res.json({ message: 'Khor Suan Boon Backend is running!' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});