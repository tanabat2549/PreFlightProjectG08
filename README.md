# PreFlightProjectG08

# 🔮 แอป "ขอส่วนบุญ" (Khorsuanboon Project)

> แอปพลิเคชันสำหรับการไหว้พระ ทำบุญ เสริมดวง เขย่าเซียมซี และค้นหาวัดใกล้เคียง

---

## 📋 Checklist สิ่งที่ต้องทำ (Tasks & To-Do List)

### 🗄️ 1. งานฝั่ง Backend & Database (`/BACKEND`)

- [ ] **Database Setup & Migration**
  - [ ] เปิด PostgreSQL บน Docker (`docker compose up -d`)
  - [ ] ตรวจสอบความถูกต้องของ Schema ใน `src/db/schema.ts` (7 ตารางหลัก)
  - [ ] รันคำสั่ง Sync Schema เข้า Database (`npm run db:push`)
  - [ ] สร้างไฟล์ Seed Data เพื่อใส่ข้อมูลเริ่มต้น (ใบเซียมซี 28 ใบ, วัดตัวอย่าง, วันพระ)

- [ ] **ระบบสมาชิก & Auth (`/api/auth`)**
  - [ ] `POST /api/auth/register` — สมัครสมาชิก + คำนวณราศีจากวันเกิด
  - [ ] `POST /api/auth/login` — เข้าสู่ระบบด้วย Email/Password + ส่งกลับ JWT Token
  - [ ] `POST /api/auth/google` — รองรับ Google OAuth Login

- [ ] **ระบบเซียมซี (`/api/siemsee`)**
  - [ ] `GET /api/siemsee/draw` — สุ่มเซียมซี (พร้อม Validation ห้ามสุ่มเกิน 1 ครั้ง/วัน)
  - [ ] `GET /api/siemsee/history` — ดึงประวัติการเขย่าเซียมซีย้อนหลังตาม User ID

- [ ] **ระบบค้นหาวัด & รีวิว (`/api/temples`)**
  - [ ] `GET /api/temples` — ค้นหาวัด + คำนวณระยะทางจากพิกัด Lat/Lng ผู้ใช้ (Haversine Formula)
  - [ ] `GET /api/temples/:id` — ดึงรายละเอียดวัด + รีวิวทั้งหมด
  - [ ] `POST /api/temples/:id/reviews` — ให้ดาว (1-5) และเพิ่มข้อความรีวิว

- [ ] **ระบบดวง & ปฏิทิน (`/api/horoscope`, `/api/calendar`)**
  - [ ] `GET /api/horoscope/daily` — ดึงดวงประจำวันตามราศีของผู้ใช้
  - [ ] `GET /api/calendar/auspicious-days` — ดึงวันพระและวันมงคลประจำเดือน

---

### 🎨 2. งานฝั่ง Frontend (`/FRONTEND`)

- [ ] **โครงสร้างโปรเจกต์ & API Connection**
  - [ ] แยกโค้ดจาก `App.tsx` ไปไว้ตามโฟลเดอร์ใน `src/pages/`
  - [ ] สร้าง API Client Service ด้วย Axios ใน `src/services/api.ts`
  - [ ] เชื่อมต่อ `.env` เข้ากับ Axios Base URL (`VITE_API_BASE_URL`)

- [ ] **พัฒนาหน้า UI ตาม Mockup**
  - [ ] **หน้าแรก (`HomePage.tsx`):** แสดงสรุปดวงประจำวัน + ดึงวัดใกล้ฉันจาก API
  - [ ] **หน้าค้นหาวัด (`TemplePage.tsx`):**
    - [ ] รวมคอมโพเนนต์ Google Maps (ใช้ `VITE_GOOGLE_MAPS_API_KEY`)
    - [ ] ทำระบบกักตัวกรอง (ใกล้ฉัน / ยอดนิยม / เปิดตอนนี้)
  - [ ] **หน้าเซียมซี (`SiemseePage.tsx`):**
    - [ ] เพิ่มแอนิเมชันตอนเขย่ากระบอกเซียมซี
    - [ ] ดึงผลทำนาย 5 หมวดจาก Backend มาแสดงผล
  - [ ] **หน้าปฏิทิน (`CalendarPage.tsx`):** ทำการ์ดแสดงวันพระถัดไป และปฏิทินรายเดือน
  - [ ] **หน้าโปรไฟล์ & สถิติ (`ProfilePage.tsx`):** แสดงสถิติการเขย่าเซียมซี / รีวิว และปุ่ม Logout
  - [ ] **หน้าเข้าสู่ระบบ / สมัครสมาชิก (`LoginPage.tsx`):** ทำ Form Validation + Google Login

---

### 🛠️ 3. งาน Configuration & Environment

- [ ] ตรวจสอบว่ามีไฟล์ `.env` และ `.env.example` ทั้งใน `BACKEND` และ `FRONTEND`
- [ ] ตั้งค่า CORS ใน Backend เพื่อยอมรับ Request จาก `http://localhost:5173`
- [ ] ทดสอบการทำงานเชื่อมกันระหว่าง Frontend และ Backend (Integration Test)

---

## 🚀 ขั้นตอนการเปิดรันโปรเจกต์ (Quick Start)

### 1. เปิด Database
```bash
docker compose up -d

### 2. รัน Backend (Terminal 1)

cd BACKEND
npm install
npm run db:push
npm run dev


###3. รัน Frontend (Terminal 2)

cd FRONTEND
npm install
npm run dev


🎨 สเปกโทนสีของแอป (Design Tokens)
สีทองนวล (Primary Gold): #C9A03D

สีแดงอิฐ (Stamp Red): #8C3B3B

สีพื้นหลังครีม (Background Cream): #FDFBF7

สีตัวหนังสือหลัก (Text Main): #332C27

ฟอนต์หลัก: Noto Serif Thai (หัวข้อ) / Noto Sans Thai (เนื้อหา)