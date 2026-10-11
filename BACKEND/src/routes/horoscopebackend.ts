import { Router } from "express";
import { dbClient as db } from "../db/client.js";
import { dailyHoroscopes } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

const router = Router();

// GET /api/horoscope — ดึงข้อมูลดวงประจำวันทั้งหมด
router.get("/", async (_req, res) => {
  try {
    const list = await db.select().from(dailyHoroscopes);
    return res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error("Error fetching horoscopes:", error);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

// GET /api/horoscope/daily — ดึงข้อมูลดวงประจำวัน (รองรับ ?id= หรือสุ่ม)
router.get("/daily", async (req, res) => {
  try {
    const idParam = req.query.id ? Number(req.query.id) : undefined;
    let daily;

    if (idParam && !isNaN(idParam)) {
      const rows = await db
        .select()
        .from(dailyHoroscopes)
        .where(eq(dailyHoroscopes.id, idParam))
        .limit(1);
      daily = rows[0];
    }

    if (!daily) {
      const [randomDaily] = await db
        .select()
        .from(dailyHoroscopes)
        .orderBy(sql`RANDOM()`)
        .limit(1);
      daily = randomDaily;
    }

    if (!daily) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลดวงประจำวัน" });
    }

    return res.json({ success: true, data: daily, ...daily });
  } catch (error) {
    console.error("Error fetching daily horoscope:", error);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

export default router;