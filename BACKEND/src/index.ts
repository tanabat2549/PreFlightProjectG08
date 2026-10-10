import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';


// นำเข้า Router ฝั่ง User & Public
import siemseeRouter from './routes/siemseebackend.js';
import authRouter from './routes/LoginBackend.js';
import horoscopeRouter from './routes/horoscopebackend.js';
import calendarRouter from './routes/calendarbackend.js';
import templeRouter from './routes/templebackend.js';
import profileRouter from './routes/profilebackend.js';

import adminRouter from './routes/admin/index.js';



const app = express();
app.disable('etag');

const port = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://fsg08.cpecmu.com',
  process.env.CORS_ORIGIN,
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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// ==========================================
// ลงทะเบียน Path ทั้งหมดในระบบ
// ==========================================
app.use('/api/siemsee', siemseeRouter);
app.use('/api/horoscope', horoscopeRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/temples', templeRouter);
app.use('/api/user', profileRouter);
app.use('/api', authRouter);

//ลงทะเบียน Path ฝั่ง Admin (รวมทุกฟีเจอร์หลังบ้านไว้ที่นี่)
app.use('/api/admin', adminRouter);
app.get('/health', (_req, res) => {
  res.json({ message: 'Khor Suan Boon Backend is running!' });
});

// เริ่มรันเซิร์ฟเวอร์เพียงครั้งเดียวและเก็บใส่ตัวแปร server ไว้ใช้ทำ Graceful Shutdown
const server = app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
