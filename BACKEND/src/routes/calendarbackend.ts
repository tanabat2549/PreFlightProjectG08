
import { Router } from "express";
import { dbClient as db } from "../db/client.js";
import { auspiciousDays } from "../db/schema.js";
import { sql } from "drizzle-orm";

const router = Router();

// GET /api/calendar/auspicious-days?month=8&year=2026
router.get("/auspicious-days", async (req, res) => {
  try {
    const today = new Date();
    const month = req.query.month ? Number(req.query.month) : today.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : today.getFullYear();

    // กรองดึงเฉพาะวันในเดือนและปีที่ระบุ
    const days = await db
      .select()
      .from(auspiciousDays)
      .where(
        sql`EXTRACT(MONTH FROM ${auspiciousDays.date}::date) = ${month} 
            AND EXTRACT(YEAR FROM ${auspiciousDays.date}::date) = ${year}`
      );

    return res.json({
      month,
      year,
      count: days.length,
      data: days,
    });
  } catch (error) {
    console.error("Calendar Fetch Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
//  GET /api/calendar/year-grouped?year=2026 - ดึงทั้งปีแบบแยกจัดกลุ่มตามเดือน (1-12)
router.get("/year-grouped", async (req, res) => {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

    // 1. ดึงวันมงคลทั้งหมดในปีนั้น
    const days = await db
      .select()
      .from(auspiciousDays)
      .where(sql`EXTRACT(YEAR FROM ${auspiciousDays.date}::date) = ${year}`);

    // 2. จัดกลุ่มข้อมูลตามเดือน (Month 1 - 12)
    const groupedByMonth: Record<number, typeof days> = {};
    
    // สร้าง Array มารองรับทั้ง 12 เดือน (1-12)
    for (let i = 1; i <= 12; i++) {
      groupedByMonth[i] = [];
    }

    // เอาข้อมูลแต่ละวันใส่ลงตามเดือนของมัน
    days.forEach((day) => {
      const monthNum = new Date(day.date).getMonth() + 1;
      if (groupedByMonth[monthNum]) {
        groupedByMonth[monthNum].push(day);
      }
    });

    return res.json({
      success: true,
      year,
      data: groupedByMonth, // ได้โครงสร้าง { "1": [...], "2": [...], ..., "12": [...] }
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
      .where(
        sql`EXTRACT(YEAR FROM ${auspiciousDays.date}::date) = ${year}`
      );

    return res.json({
      success: true,
      year,
      totalDays: days.length,
      data: days,
    });
  } catch (error) {
    console.error("Yearly Calendar Fetch Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;