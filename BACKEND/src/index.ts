// index.ts (backend)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import siemseeRouter from './routes/siemseebackend.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 🟢 รายการ URL ที่อนุญาตให้ยิงมาหา Backend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://fgs08.cpecmu.com',
  process.env.CORS_ORIGIN // ดึงจาก .env เพิ่มเติม (ถ้ามี)
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // อนุญาตหากยิงมาจาก allowedOrigins หรือกรณีไม่มี origin (เช่น Postman / Server-to-Server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // หรือ callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Routes
app.use('/api/siemsee', siemseeRouter);

app.get('/health', (req, res) => {
  res.json({ message: 'Khor Suan Boon Backend is running!' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});