import { Router } from "express";
import { dbClient as db } from "../db/client.js";
import { dailyHoroscopes } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

//  1. GET /api/horoscope/all-daily?date=2026-08-06
// ดึงข้อมูลดวงประจำวันของ "ทุกราศี" พร้อมกันใน Request เดียว
router.get("/all-daily", async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = (date as string) || new Date().toISOString().split("T")[0];

    const result = await db
      .select()
      .from(dailyHoroscopes)
      .where(sql`${dailyHoroscopes.date}::text = ${targetDate}`);

    if (result.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `ไม่พบข้อมูลดวงประจำวันที่ ${targetDate}` 
      });
    }

    return res.json({
      success: true,
      date: targetDate,
      totalCount: result.length,
      data: result, // ได้ Array ของทั้ง 12 ราศี
    });
  } catch (error) {
    console.error("Fetch All Daily Horoscope Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. GET /api/horoscope/daily?zodiac=aries&date=2026-08-06
// ดึงข้อมูลดวงเฉพาะ "ราศีที่ระบุ" รายวัน
router.get("/daily", async (req, res) => {
  try {
    const { zodiac, date } = req.query;

    if (!zodiac) {
      return res.status(400).json({ error: "กรุณาระบุราศี (zodiac)" });
    }

    const targetDate = (date as string) || new Date().toISOString().split("T")[0];

    const result = await db
      .select()
      .from(dailyHoroscopes)
      .where(
        and(
          eq(dailyHoroscopes.zodiacSign, zodiac as any),
          sql`${dailyHoroscopes.date}::text = ${targetDate}`
        )
      )
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลดวงสำหรับวันที่ระบุ" });
    }

    return res.json(result[0]);
  } catch (error) {
    console.error("Horoscope Fetch Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//  3. GET /api/horoscope/zodiacs
// Master Data สำหรับดึงรายชื่อราศีทั้งหมดพร้อมคำแปลภาษาไทยและช่วงวัน
router.get("/zodiacs", (req, res) => {
  const zodiacList = [
    { key: "aries", nameTh: "ราศีเมษ", nameEn: "Aries", dateRange: "13 เม.ย. - 13 พ.ค." },
    { key: "taurus", nameTh: "ราศีพฤษภ", nameEn: "Taurus", dateRange: "14 พ.ค. - 13 มิ.ย." },
    { key: "gemini", nameTh: "ราศีเมถุน", nameEn: "Gemini", dateRange: "14 มิ.ย. - 14 ก.ค." },
    { key: "cancer", nameTh: "ราศีกรกฎ", nameEn: "Cancer", dateRange: "15 ก.ค. - 16 ส.ค." },
    { key: "leo", nameTh: "ราศีสิงห์", nameEn: "Leo", dateRange: "17 ส.ค. - 16 ก.ย." },
    { key: "virgo", nameTh: "ราศีกันย์", nameEn: "Virgo", dateRange: "17 ก.ย. - 16 ต.ค." },
    { key: "libra", nameTh: "ราศีตุลย์", nameEn: "Libra", dateRange: "17 ต.ค. - 15 พ.ย." },
    { key: "scorpio", nameTh: "ราศีพิจิก", nameEn: "Scorpio", dateRange: "16 พ.ย. - 15 ธ.ค." },
    { key: "sagittarius", nameTh: "ราศีธนู", nameEn: "Sagittarius", dateRange: "16 ธ.ค. - 13 ม.ค." },
    { key: "capricorn", nameTh: "ราศีมังกร", nameEn: "Capricorn", dateRange: "14 ม.ค. - 12 ก.พ." },
    { key: "aquarius", nameTh: "ราศีกุมภ์", nameEn: "Aquarius", dateRange: "13 ก.พ. - 13 มี.ค." },
    { key: "pisces", nameTh: "ราศีมีน", nameEn: "Pisces", dateRange: "14 มี.ค. - 12 เม.ย." },
  ];

  return res.json({ success: true, data: zodiacList });
});

export default router;