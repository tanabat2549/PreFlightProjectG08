import { Router } from "express";
import { dbClient as db } from "../db/client.js";
import { auspiciousDays } from "../db/schema.js";
import { sql } from "drizzle-orm";

const router = Router();

// Helper สำหรับแปลง recommendedActivities จาก JSON String เป็น Array ป้องกัน Frontend พัง
function formatDayItem(day: any) {
  let activities = [];
  if (typeof day.recommendedActivities === "string") {
    try {
      activities = JSON.parse(day.recommendedActivities);
    } catch {
      activities = [];
    }
  } else if (Array.isArray(day.recommendedActivities)) {
    activities = day.recommendedActivities;
  }

  return {
    ...day,
    recommendedActivities: activities,
  };
}

// GET /api/calendar/next
router.get("/next", async (req, res) => {
  try {
    // รับวันที่ที่ส่งมาจาก Frontend ถ้าไม่มีให้ใช้เวลาไทยปัจจุบัน
    const clientToday = req.query.today as string;
    let today = clientToday;

    if (!today) {
      const now = new Date();
      const thaiDateFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      today = thaiDateFormatter.format(now);
    }

    const nextDay = await db
      .select()
      .from(auspiciousDays)
      .where(sql`${auspiciousDays.date}::date >= ${today}::date`)
      .orderBy(sql`${auspiciousDays.date} ASC`)
      .limit(1);

    if (!nextDay.length) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลวันพระถัดไป" });
    }

    return res.json({
      success: true,
      data: formatDayItem(nextDay[0]),
    });
  } catch (error) {
    console.error("Fetch Next Buddha Day Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/calendar/auspicious-days?month=8&year=2026
router.get("/auspicious-days", async (req, res) => {
  try {
    const today = new Date();
    const month = req.query.month ? Number(req.query.month) : today.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : today.getFullYear();

    // กรองดึงเฉพาะวันในเดือนและปีที่ระบุ พร้อมเรียงวันที่จากต้นเดือนไปท้ายเดือน
    const days = await db
      .select()
      .from(auspiciousDays)
      .where(
        sql`EXTRACT(MONTH FROM ${auspiciousDays.date}::date) = ${month} 
            AND EXTRACT(YEAR FROM ${auspiciousDays.date}::date) = ${year}`
      )
      .orderBy(sql`${auspiciousDays.date} ASC`);

    return res.json({
      month,
      year,
      count: days.length,
      data: days.map(formatDayItem), // นำ formatDayItem ไปครอบตรงนี้
    });
  } catch (error) {
    console.error("Calendar Fetch Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/calendar/year-grouped?year=2026 - ดึงทั้งปีแบบแยกจัดกลุ่มตามเดือน (1-12)
router.get("/year-grouped", async (req, res) => {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

    // 1. ดึงวันมงคลทั้งหมดในปีนั้น
    const days = await db
      .select()
      .from(auspiciousDays)
      .where(sql`EXTRACT(YEAR FROM ${auspiciousDays.date}::date) = ${year}`)
      .orderBy(sql`${auspiciousDays.date} ASC`);

    // 2. จัดกลุ่มข้อมูลตามเดือน (Month 1 - 12)
    const groupedByMonth: Record<number, any[]> = {};
    for (let i = 1; i <= 12; i++) {
      groupedByMonth[i] = [];
    }

    // สกัดเดือนจากสตริง YYYY-MM-DD เพื่อป้องกันปัญหา Timezone เพี้ยน และแปลงกิจกรรมเป็น Array
    days.forEach((day) => {
      const monthNum = Number(String(day.date).split("-")[1]);
      if (groupedByMonth[monthNum]) {
        groupedByMonth[monthNum].push(formatDayItem(day));
      }
    });

    return res.json({
      success: true,
      year,
      data: groupedByMonth,
    });
  } catch (error) {
    console.error("Year Grouped Fetch Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/calendar/year?year=2026 - ดึงวันมงคลทั้งหมดของทั้งปี
router.get("/year", async (req, res) => {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

    const days = await db
      .select()
      .from(auspiciousDays)
      .where(sql`EXTRACT(YEAR FROM ${auspiciousDays.date}::date) = ${year}`)
      .orderBy(sql`${auspiciousDays.date} ASC`);

    return res.json({
      success: true,
      year,
      totalDays: days.length,
      data: days.map(formatDayItem), // นำ formatDayItem ไปครอบตรงนี้
    });
  } catch (error) {
    console.error("Yearly Calendar Fetch Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;