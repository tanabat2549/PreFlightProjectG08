import { Router } from 'express';
import type { Response } from 'express';
import { dbClient as db } from '../../db/client.js';
import { users, temples, reviews, fortunes, auspiciousDays, siemseeHistories } from '../../db/schema.js';
import { desc, sql } from 'drizzle-orm';
import type { AdminRequest } from '../../middlewares/roles.js';

// Router นี้ถูก mount ที่ /api/admin/stats
const router = Router();

const DAYS = 14;

type DayCount = { day: string; count: number };

// GET /api/admin/stats — สถิติภาพรวมสำหรับหน้า Dashboard
router.get('/', async (_req: AdminRequest, res: Response) => {
  try {
    const countOf = sql<number>`count(*)::int`;

    const [
      userTotals,
      byRole,
      [templeCount],
      [reviewCount],
      [fortuneCount],
      [dayCount],
      [drawCount],
      drawsPerDay,
      signupsPerDay,
      topTemples,
    ] = await Promise.all([
      db
        .select({
          total: countOf,
          active: sql<number>`count(*) filter (where ${users.isActive})::int`,
          newLast7Days: sql<number>`count(*) filter (where ${users.createdAt} >= now() - interval '7 days')::int`,
        })
        .from(users),
      db.select({ role: users.role, count: countOf }).from(users).groupBy(users.role),
      db.select({ count: countOf }).from(temples),
      db.select({ count: countOf }).from(reviews),
      db.select({ count: countOf }).from(fortunes),
      db.select({ count: countOf }).from(auspiciousDays),
      db.select({ count: countOf }).from(siemseeHistories),
      // จำนวนครั้งที่เก็บใบเซียมซีต่อวัน (เติมวันที่ไม่มีข้อมูลเป็น 0)
      db.execute<DayCount>(sql`
        select to_char(d::date, 'YYYY-MM-DD') as day, count(h.id)::int as count
        from generate_series(current_date - ${DAYS - 1} * interval '1 day', current_date, interval '1 day') d
        left join ${siemseeHistories} h on h.drawn_at::date = d::date
        group by d
        order by d
      `),
      // ผู้ใช้สมัครใหม่ต่อวัน
      db.execute<DayCount>(sql`
        select to_char(d::date, 'YYYY-MM-DD') as day, count(u.id)::int as count
        from generate_series(current_date - ${DAYS - 1} * interval '1 day', current_date, interval '1 day') d
        left join ${users} u on u.created_at::date = d::date
        group by d
        order by d
      `),
      db
        .select({
          id: temples.id,
          name: temples.name,
          ratingAvg: temples.ratingAvg,
          ratingCount: temples.ratingCount,
        })
        .from(temples)
        .orderBy(desc(temples.ratingCount), desc(temples.ratingAvg))
        .limit(5),
    ]);

    const { total, active, newLast7Days } = userTotals[0];

    return res.json({
      success: true,
      data: {
        users: { total, active, locked: total - active, newLast7Days },
        usersByRole: byRole,
        totals: {
          temples: templeCount.count,
          reviews: reviewCount.count,
          fortunes: fortuneCount.count,
          auspiciousDays: dayCount.count,
          siemseeDraws: drawCount.count,
        },
        siemseeDrawsPerDay: Array.from(drawsPerDay),
        signupsPerDay: Array.from(signupsPerDay),
        topTemples,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
