# 🔮 ขอส่วนบุญ (Khorsuanboon)
 
### PreFlightProjectG08
 
---
 
## 📑 สารบัญ
 
- [ ฟีเจอร์หลัก](#-ฟีเจอร์หลัก)
- [ Tech Stack](#️-tech-stack)
- [ โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์)
- [ สิ่งที่ต้องเตรียม](#-สิ่งที่ต้องเตรียม)
- [ ตั้งค่า Environment](#-ตั้งค่า-environment)
- [ วิธีที่ 1: รันแบบ Local (Manual)](#-วิธีที่-2-รันแบบ-local-manual)
- [ คำสั่งฐานข้อมูล](#️-คำสั่งฐานข้อมูล)
- [ พอร์ตที่ใช้งาน](#-พอร์ตที่ใช้งาน)
- [ แก้ปัญหาที่พบบ่อย](#-แก้ปัญหาที่พบบ่อย)
---
 
## ✨ ฟีเจอร์หลัก
 
| ฟีเจอร์ | รายละเอียด |
|---|---|
| 🎋 เขย่าเซียมซี | ดูคำทำนายเซียมซี |
| 🛕 ค้นหาวัดใกล้เคียง | ค้นหาวัดใกล้ตัวคุณ |
| 🔑 เข้าสู่ระบบ | สมัคร/เข้าสู่ระบบด้วยอีเมลหรือ Google |
 
---
 
## 🛠️ Tech Stack
 
| ส่วน | เทคโนโลยี |
|---|---|
| 🎨 **Frontend** | React 19, Vite, TypeScript, React Router, Axios, Lucide React |
| ⚙️ **Backend** | Node.js, Express 5, TypeScript |
| 🗄️ **Database** | PostgreSQL + Drizzle ORM |
| 🔐 **Auth** | JWT, bcryptjs, Google OAuth (`@react-oauth/google`, `google-auth-library`) |
| 🛡️ **Security** | Helmet, CORS |
| 🐳 **DevOps** | Docker, Docker Compose |
 
---
 
## 📁 โครงสร้างโปรเจกต์
 
```text
PreFlightProjectG08/
├── BACKEND/             # Express API + Drizzle ORM
│   ├── src/             # โค้ดหลักของ API
│   └── db/              # Schema และไฟล์ฐานข้อมูล
├── FRONTEND/            # React + Vite client
├── docker-compose.yml   # รันทุกบริการพร้อมกัน
└── README.md
```
 
---
 
## 🧰 สิ่งที่ต้องเตรียม
 
| วิธีรัน | ต้องมี |
|---|---|
| 🐳 Docker | [Docker](https://www.docker.com/) และ Docker Compose |
| 💻 Local | [Node.js](https://nodejs.org/) (แนะนำ LTS ล่าสุด) + npm และ [PostgreSQL](https://www.postgresql.org/) (พอร์ต `5432`) |
 
---
 
## 🔐 ตั้งค่า Environment
 
สร้างไฟล์ `.env` ในโฟลเดอร์ `BACKEND` และ `FRONTEND` ตามตัวอย่างด้านล่าง
 
**`BACKEND/.env`**
 
```env
PORT=3001
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/DB_NAME
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
```
 
**`FRONTEND/.env`**
 
```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
 
> ⚠️ **ห้าม commit ไฟล์ `.env` ขึ้น Git** ให้เพิ่มไว้ใน `.gitignore`
> 💡 ขอ Google Client ID ได้ที่ [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
 
---
 
## 💻 วิธีที่ 1: รันแบบ Local (Manual)
 
> ⚠️ ใช้สำหรับทดสอบหรือรันโปรเจกต์โดยตรงบนเครื่อง
> **ต้องเปิด PostgreSQL ไว้ที่พอร์ต `5432` ก่อนเริ่ม**
 
### 🔧 ขั้นตอนที่ 1: Backend API (Terminal 1)
 
```bash
cd BACKEND
npm install
npx drizzle-kit push
npm run db:seed      # (ไม่บังคับ) ใส่ข้อมูลตั้งต้น
npm run dev
```
 
✅ Backend จะทำงานที่ 👉 **http://localhost:3001**
 
### 🎨 ขั้นตอนที่ 2: Frontend Client (Terminal 2)
 
```bash
cd FRONTEND
npm install
npm run dev
```
 
✅ Frontend จะทำงานที่ 👉 **http://localhost:5173**
 
---
 
## 🗄️ คำสั่งฐานข้อมูล
 
รันในโฟลเดอร์ `BACKEND`
 
| คำสั่ง | หน้าที่ |
|---|---|
| `npm run db:generate` | สร้างไฟล์ migration จาก schema |
| `npm run db:push` | ซิงก์ schema เข้าฐานข้อมูลโดยตรง |
| `npm run db:migrate` | รัน migration |
| `npm run db:seed` | ใส่ข้อมูลตั้งต้น (seed) |
 
### 📦 สคริปต์อื่นๆ
 
| ส่วน | คำสั่ง | หน้าที่ |
|---|---|---|
| Backend | `npm run build` | คอมไพล์ TypeScript |
| Backend | `npm start` | รันโค้ดที่บิลด์แล้ว (production) |
| Frontend | `npm run build` | บิลด์สำหรับ production |
| Frontend | `npm run lint` | ตรวจโค้ดด้วย ESLint |
| Frontend | `npm run preview` | พรีวิวเวอร์ชันที่บิลด์แล้ว |
 
---
 
## 🌐 พอร์ตที่ใช้งาน
 
| บริการ | โหมด | URL |
|---|---|---|
| 🖥️ Web App | Docker | http://localhost:6008 |
| ⚙️ Backend API | Local | http://localhost:3001 |
| 🎨 Frontend | Local | http://localhost:5173 |
| 🗄️ PostgreSQL | Local | `localhost:5432` |
 
---
 
## 🩺 แก้ปัญหาที่พบบ่อย
 
| ปัญหา | วิธีแก้ |
|---|---|
| ❌ พอร์ตถูกใช้งานอยู่ | ปิดโปรแกรมที่ใช้พอร์ตนั้น หรือเปลี่ยนพอร์ตใน `docker-compose.yml` |
| ❌ เชื่อมต่อฐานข้อมูลไม่ได้ | ตรวจว่า PostgreSQL เปิดอยู่ และ `DATABASE_URL` ถูกต้อง |
| ❌ ข้อมูลใน Docker เพี้ยน | รัน `docker compose down -v` แล้ว `docker compose up --build -d` ใหม่ |
| ❌ Google Login ใช้ไม่ได้ | ตรวจ `GOOGLE_CLIENT_ID` และเพิ่ม `http://localhost:5173` ใน Authorized origins |
 
---
 
 

**สาธุ 🙏 ขอให้โชคดีมีสุข**
 
Made with ❤️ by PreFlight Group 08
---