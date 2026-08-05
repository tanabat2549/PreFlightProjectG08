import { 
  pgTable, serial, varchar, text, integer, doublePrecision, 
  timestamp, date, boolean, unique, index, time, pgEnum 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==========================================
// 0. Enums (ประกาศค่าคงที่ที่ตายตัว)
// ==========================================
export const zodiacEnum = pgEnum('zodiac_sign', [
  'aries', 'taurus', 'gemini', 'cancer', 
  'leo', 'virgo', 'libra', 'scorpio', 
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
]);

// ==========================================
// 1. ตารางผู้ใช้งาน
// ==========================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).unique(),
  phone: varchar('phone', { length: 20 }).unique(),
  password: text('password'),
  birthDate: date('birth_date'),
  picture: text('picture'),
  googleId: varchar('google_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()).notNull(),
}, (t) => ({
  emailIdx: index('email_idx').on(t.email),
  googleIdIdx: index('google_id_idx').on(t.googleId),
}));

// ==========================================
// 2. ตารางวัด
// ==========================================
export const temples = pgTable('temples', {
  id: serial('id').primaryKey(),

  //เก็บรหัสสถานที่จาก Google (ใช้อ้างอิงไม่ให้บันทึกวัดซ้ำ)
  googlePlaceId: varchar('google_place_id', { length: 255 }).unique(),

  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  address: text('address'),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  openTime: time('open_time'),   
  closeTime: time('close_time'), 
  imageUrl: text('image_url'),
  ratingAvg: doublePrecision('rating_avg').default(0),
  ratingCount: integer('rating_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

// ==========================================
// 3. ตารางรีวิววัด
// ==========================================
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  templeId: integer('temple_id').references(() => temples.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()).notNull(),
}, (t) => ({
  templeIdx: index('temple_id_idx').on(t.templeId),
  userIdIdx: index('user_id_idx').on(t.userId),
}));

// ==========================================
// 4. ตารางใบเซียมซี
// ==========================================
export const fortunes = pgTable('fortunes', {
  id: serial('id').primaryKey(),
  number: integer('number').notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  workFortune: text('work_fortune').notNull(),
  loveFortune: text('love_fortune').notNull(),
  moneyFortune: text('money_fortune').notNull(),
  studyFortune: text('study_fortune').notNull(),
  healthFortune: text('health_fortune').notNull(),
});

// ==========================================
// 5. ตารางประวัติการเขย่าเซียมซี
// ==========================================
export const siemseeHistories = pgTable('siemsee_histories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  fortuneId: integer('fortune_id').references(() => fortunes.id).notNull(),
  drawnAt: timestamp('drawn_at').defaultNow().notNull(),
}, (t) => ({
  userDrawnIdx: index('user_drawn_idx').on(t.userId, t.drawnAt),
}));

// ==========================================
// 6. ตารางดวงประจำวัน
// ==========================================
export const dailyHoroscopes = pgTable('daily_horoscopes', {
  id: serial('id').primaryKey(),
  zodiacSign: zodiacEnum('zodiac_sign').notNull(),
  date: date('date').notNull(),
  luckyColor: varchar('lucky_color', { length: 50 }).notNull(),
  luckyNumber: varchar('lucky_number', { length: 50 }).notNull(),
  description: text('description').notNull(),
}, (t) => ({
  unq: unique('zodiac_date_idx').on(t.zodiacSign, t.date),
}));

// ==========================================
// 7. ตารางปฏิทินวันพระ / วันมงคล
// ==========================================
export const auspiciousDays = pgTable('auspicious_days', {
  id: serial('id').primaryKey(),
  date: date('date').notNull().unique(),
  isBuddhaDay: boolean('is_buddha_day').default(false),
  isAuspiciousDay: boolean('is_auspicious_day').default(false),
  title: varchar('title', { length: 255 }).notNull(),
  recommendedActivities: text('recommended_activities'),
});

// ==========================================
// Drizzle Relations (สำหรับ Relational Queries)
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  siemseeHistories: many(siemseeHistories),
}));

export const templesRelations = relations(temples, ({ many }) => ({
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  temple: one(temples, {
    fields: [reviews.templeId],
    references: [temples.id],
  }),
}));

export const fortunesRelations = relations(fortunes, ({ many }) => ({
  siemseeHistories: many(siemseeHistories),
}));

export const siemseeHistoriesRelations = relations(siemseeHistories, ({ one }) => ({
  user: one(users, {
    fields: [siemseeHistories.userId],
    references: [users.id],
  }),
  fortune: one(fortunes, {
    fields: [siemseeHistories.fortuneId],
    references: [fortunes.id],
  }),
}));