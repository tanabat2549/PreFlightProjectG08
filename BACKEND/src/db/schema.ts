import { pgTable, serial, varchar, text, integer, doublePrecision, timestamp, date, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. ตารางผู้ใช้งาน
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).unique(),
  phone: varchar('phone', { length: 20 }).unique(),
  password: text('password'), // nullable เผื่อล็อกอินด้วย Google
  birthDate: date('birth_date').notNull(), // ใช้คำนวณราศี/ดวง
  googleId: varchar('google_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. ตารางวัด
export const temples = pgTable('temples', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  address: text('address'),
  latitude: doublePrecision('latitude').notNull(),  // พิกัด Lat
  longitude: doublePrecision('longitude').notNull(), // พิกัด Lng
  openTime: varchar('open_time', { length: 10 }),   // เช่น "06:00"
  closeTime: varchar('close_time', { length: 10 }), // เช่น "18:00"
  imageUrl: text('image_url'),
  ratingAvg: doublePrecision('rating_avg').default(0),
  ratingCount: integer('rating_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. ตารางรีวิววัด
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  templeId: integer('temple_id').references(() => temples.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // 1 - 5 ดาว
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. ตารางใบเซียมซี (คำทำนายแยก 5 หมวด)
export const fortunes = pgTable('fortunes', {
  id: serial('id').primaryKey(),
  number: integer('number').notNull().unique(), // ใบที่ 1-28
  title: varchar('title', { length: 255 }).notNull(), // เช่น "ใบที่ 1 มหาโชค"
  workFortune: text('work_fortune').notNull(),     // การงาน
  loveFortune: text('love_fortune').notNull(),     // ความรัก
  moneyFortune: text('money_fortune').notNull(),   // การเงิน
  studyFortune: text('study_fortune').notNull(),   // การเรียน
  healthFortune: text('health_fortune').notNull(), // สุขภาพ
});

// 5. ตารางประวัติการเขย่าเซียมซี
export const siemseeHistories = pgTable('siemsee_histories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  fortuneId: integer('fortune_id').references(() => fortunes.id).notNull(),
  drawnAt: timestamp('drawn_at').defaultNow().notNull(), // ใช้นับว่าวันนี้ดวงไปหรือยัง (1 วัน/1 ใบ)
});

// 6. ตารางดวงประจำวัน (แยกตามราศี)
export const dailyHoroscopes = pgTable('daily_horoscopes', {
  id: serial('id').primaryKey(),
  zodiacSign: varchar('zodiac_sign', { length: 50 }).notNull(), // เช่น "ราศีเมษ"
  date: date('date').notNull(),
  luckyColor: varchar('lucky_color', { length: 50 }).notNull(),
  luckyNumber: varchar('lucky_number', { length: 50 }).notNull(),
  description: text('description').notNull(),
});

// 7. ตารางปฏิทินวันพระ / วันมงคล
export const auspiciousDays = pgTable('auspicious_days', {
  id: serial('id').primaryKey(),
  date: date('date').notNull().unique(),
  isBuddhaDay: boolean('is_buddha_day').default(false), // เป็นวันพระหรือไม่
  isAuspiciousDay: boolean('is_auspicious_day').default(false), // เป็นวันมงคลหรือไม่
  title: varchar('title', { length: 255 }).notNull(), // เช่น "วันขึ้น ๑๕ ค่ำ เดือน ๘"
  recommendedActivities: text('recommended_activities'), // คำแนะนำกิจกรรม
});