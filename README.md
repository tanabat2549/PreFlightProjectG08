# 🪷 ขอส่วนบุญ (Khorsuanboon Project - G08)

> **เว็บแอปพลิเคชันสายมูยุคใหม่** สำหรับการไหว้พระ ทำบุญ เช็กดวงชะตามงคลประจำวัน เสี่ยงทายเซียมซี ปฏิทินวันพระ และค้นหาวัดใกล้เคียง

---

## 🛠️ Tech Stack

### Frontend (`/FRONTEND`)
- **Core:** React 19, TypeScript, Vite
- **Routing:** React Router v7
- **Authentication:** Google OAuth (`@react-oauth/google`)
- **HTTP Client:** Axios (เชื่อมต่อผ่าน `src/services/api.ts`)
- **Styling:** Modern Thai Minimalist, Glassmorphism, CSS Modules & Bento Grid Layout

### Backend (`/BACKEND`)
- **Runtime & Framework:** Node.js, Express 5, TypeScript
- **Database & ORM:** PostgreSQL (Docker), Drizzle ORM
- **Auth & Security:** Google Auth Library, JWT, Bcryptjs, CORS, Helmet
- **Third-party APIs:** Google Places API (Nearby Search & Photos)

---

## 🌟 ฟีเจอร์หลัก (Key Features)

### 1. 🏠 หน้าแรก (Sanctuary Dashboard - `Home.tsx`)
- **คติธรรมนำชีวิตประจำวัน (Daily Quote):** แสดงคำคมเตือนสติใน Hero Banner ประจำวัน
- **ถวายประทีปบูชาประจำวัน:** กดรับแต้มบารมี (+50 แต้ม) ล็อกสิทธิ์วันละ 1 ครั้งตามวันที่ปฏิทินจริง
- **ดวงมงคลประจำวัน (Daily Auspicious Bento):**
  - แสดงวันเกิดของผู้ใช้ (เช่น วันพฤหัสบดี, วันจันทร์)
  - ข้อมูลสีมงคลเหนี่ยวทรัพย์, สีการงาน, และสีกาลกิณีที่ควรเลี่ยง (พร้อมโค้ดสี HEX)
  - เหรียญทองเลขเด่นนำโชค, กัลยาณมิตรเกื้อหนุน, และเคล็ดลับทำบุญเสริมดวง
  - **ระบบแคชรายวัน (Daily Cache via LocalStorage):** จำคำทำนายไว้ตลอดทั้งวัน รีเฟรชหน้าไม่เปลี่ยน ข้ามวันใหม่เปลี่ยนให้อัตโนมัติ
  - **ปุ่ม "สุ่มดวงใหม่":** สุ่มชุดคำทำนายใหม่จากฐานข้อมูลได้ตามต้องการ
- **การ์ดนับถอยหลังวันพระถัดไป:** คำนวณวันนับถอยหลังอัตโนมัติจากปฏิทินวันพระ
- **การ์ดวัดใกล้คุณ:** แสดงวัดใกล้เคียงที่สุด พร้อมระยะทาง คะแนนรีวิว และรูปภาพ

### 2. 🎋 หน้าเสี่ยงทายเซียมซี (`Siemsee.tsx`)
- **3D Cylinder Shaking Animation:** แอนิเมชันเขย่ากระบอกเซียมซีพร้อมไม้เซียมซีหล่น
- **Split-Screen Reveal:** แสดงแท่งไม้เซียมซีพร้อมออร่าแสงหมุนวนคู่กับใบเซียมซีกระดาษยันต์โบราณ
- **คำทำนาย 5 ด้าน:** การงาน, การเงิน, ความรัก, การเรียน, และสุขภาพ
- **ระบบเลือกเก็บ/ทิ้ง:**
  - 📥 **เก็บใบเซียมซี:** บันทึกลงฐานข้อมูลประวัติของผู้ใช้
  - 🔄 **ทิ้งเซียมซี:** เสี่ยงทายใหม่โดยไม่บันทึกลงประวัติ

### 3. 🏛️ หน้าค้นหาวัด & แผนที่มงคล (`Temple.tsx`)
- **ค้นหาวัดใกล้เคียง:** คำนวณระยะทางจริงจากพิกัด GPS ของผู้ใช้
- **ระบบค้นหาและตัวกรอง:** ค้นหาตามชื่อวัด และกรองตามระยะทาง (5 กม., 10 กม., 20 กม.)
- **ระบบแคชข้อมูล 5 นาที:** จัดเก็บใน `sessionStorage` พร้อมนับเวลาถอยหลังและรีเฟรชข้อมูลอัตโนมัติ
- **รายละเอียดวัด & รีวิว:** ดูข้อมูลวัด, เวลาเปิด-ปิด, ปุ่มนำทาง Google Maps, คะแนนดาว และเขียนรีวิววัดจริง

### 4. 📅 หน้าปฏิทินวันพระ & วันมงคล (`Calendar.tsx`)
- รวบรวมข้อมูลวันพระและวันมงคลตลอดทั้งปี 2569 (2026)
- แสดงรายละเอียดข้างขึ้น/ข้างแรม พร้อมกิจกรรมบุญแนะนำ (ตักบาตร, ถือศีล, ฟังธรรม, ถวายภัตตาหาร)

### 5. 👤 หน้าโปรไฟล์ & สถิติบุญ (`userProfile.tsx`)
- เข้าสู่ระบบผ่าน **Google Login**
- จัดการข้อมูลดวงชะตา: วันเกิดประจำสัปดาห์, วันที่เกิด, เพศ, และคำอธิษฐานจิต
- แสดงสถิติการสร้างบุญจริง (จำนวนรอบที่เขย่าเซียมซี, จำนวนครั้งที่รีวิววัด)
- **ประวัติการเขย่าเซียมซี:** แสดงใบเซียมซีที่เคยเก็บไว้ พร้อมปุ่มลบ/ทิ้งใบเซียมซีรายรายการ
- **ประวัติรีวิววัด:** แสดงรายการรีวิวที่ผู้ใช้เคยเขียนไว้

---

## 🔐 การตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `BACKEND` และ `FRONTEND` ดังนี้:

### **`BACKEND/.env`**
```env
PORT=3001
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_APP_USER=appuser
POSTGRES_APP_PASSWORD=5678
POSTGRES_DB=khorsuanboon_db
JWT_SECRET=khorsuanboon_super_secret_key_2026
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgres://appuser:5678@127.0.0.1:5432/khorsuanboon_db

# Google OAuth Credentials & Google Maps
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

### **`FRONTEND/.env`**
```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_API_BASE_URL=/api
```

> ⚠️ **คำเตือน:** ห้าม commit ไฟล์ `.env` ขึ้น Git เป็นอันขาด

---

## 🚀 ขั้นตอนการติดตั้งและเปิดใช้งาน (Getting Started)

### 1. เริ่มต้นระบบฐานข้อมูล (Database)
เปิด Docker Container สำหรับ PostgreSQL:
```bash
docker compose up -d
```

### 2. ติดตั้งและเริ่มทำงานฝั่ง Backend
```bash
cd BACKEND
npm install

# ซิงค์ Schema และใส่ข้อมูลเริ่มต้น (Seed Data)
npm run db:push
npm run db:seed

# รัน Backend Server (Port 3001)
npm run dev
```

### 3. ติดตั้งและเริ่มทำงานฝั่ง Frontend
```bash
cd FRONTEND
npm install

# รัน Frontend Dev Server (Port 5173)
npm run dev
```

เปิด Browser ไปที่: **`http://localhost:5173`**

---

## 📡 สรุป API Endpoints

| หมวดหมู่ | Method | Endpoint | รายละเอียด |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/google` | เข้าสู่ระบบด้วย Google Token ID |
| | `POST` | `/api/login` | เข้าสู่ระบบด้วย Email/Password |
| | `POST` | `/api/register` | สมัครสมาชิกใหม่ |
| **Horoscope** | `GET` | `/api/horoscope/daily` | สุ่มข้อมูลดวงประจำวัน (`ORDER BY RANDOM() LIMIT 1`) |
| | `GET` | `/api/horoscope` | ดึงข้อมูลดวงทั้งหมด |
| **Calendar** | `GET` | `/api/calendar/next` | ดึงข้อมูลวันพระถัดไปที่ใกล้ที่สุด |
| | `GET` | `/api/calendar/auspicious-days` | ดึงข้อมูลวันพระและวันมงคลทั้งหมด |
| **Siemsee** | `GET` | `/api/siemsee/draw` | สุ่มใบเซียมซี 1 ใบ (ไม่บันทึกลงประวัติ) |
| | `POST` | `/api/siemsee/save` | บันทึกใบเซียมซีลงประวัติของ User |
| | `GET` | `/api/siemsee/history` | ดึงประวัติการเสี่ยงเซียมซีตาม User ID |
| | `DELETE` | `/api/siemsee/history/:id` | ลบประวัติใบเซียมซีรายรายการ |
| **Temples** | `GET` | `/api/temples` | ค้นหาวัดใกล้เคียงตามพิกัด Lat/Lng |
| | `GET` | `/api/temples/:id` | ดึงข้อมูลรายละเอียดวัดและรีวิวทั้งหมด |
| | `POST` | `/api/temples/:id/reviews` | เพิ่มรีวิวและให้คะแนนดาวแก่วัด |
| **User Profile** | `GET` | `/api/user/profile/:email` | ดึงข้อมูลโปรไฟล์ของผู้ใช้ตาม Email |
| | `PUT` | `/api/user/profile` | อัปเดตข้อมูลโปรไฟล์และวันเกิด |
| | `GET` | `/api/user/reviews/:email` | ดึงประวัติรีวิววัดของผู้ใช้ |

---

## 🎨 สเปกโทนสี (Design Tokens)

- **สีทองนวล (Primary Gold):** `#C99726` / `#D4AF37`
- **สีแดงเลือดหมู/มารูน (Primary Maroon):** `#7A1C28` / `#4A0E17`
- **สีพื้นหลังหลัก (Background Cream):** `#FDFBF7` / `#F7F3EB`
- **สีตัวหนังสือหลัก (Text Dark):** `#2A1810` / `#430E17`
- **ฟอนต์หลัก:** [Kanit](https://fonts.google.com/specimen/Kanit) / [Outfit](https://fonts.google.com/specimen/Outfit)