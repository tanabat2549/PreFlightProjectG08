import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbClient as db } from '../db/client.js';
import { fortunes, siemseeHistories, siemseeDailyDraws } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { requireAuth, type AuthRequest } from '../middlewares/requireAuth.js';

const router = Router();

// ---------------------------------------------------------------------------
// ตัวช่วยสำหรับจำกัดการสุ่มวันละ 1 ครั้งต่อบัญชี
// ---------------------------------------------------------------------------

// "วัน" นับตามเวลาไทย (UTC+7 ไม่มี daylight saving) รีเซ็ตทุกเที่ยงคืนเวลาไทย
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

// วันที่ปัจจุบันตามเวลาไทย รูปแบบ YYYY-MM-DD
function bangkokToday(now = new Date()): string {
  return new Date(now.getTime() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);
}

// เวลาที่จะสุ่มได้อีกครั้ง = เที่ยงคืนถัดไปตามเวลาไทย
function nextBangkokMidnight(now = new Date()): Date {
  const local = new Date(now.getTime() + BANGKOK_OFFSET_MS);
  const nextLocalMidnight = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate() + 1
  );
  return new Date(nextLocalMidnight - BANGKOK_OFFSET_MS);
}

type Fortune = typeof fortunes.$inferSelect;

interface DailyDraw {
  date: string; // วันที่สุ่ม (เวลาไทย)
  fortune: Promise<Fortune | undefined>; // เก็บเป็น Promise เพื่อกันกดสุ่มซ้อนกันสองครั้งพร้อมกัน
}

// เก็บในหน่วยความจำของ server: key = userId, value = ใบที่สุ่มได้วันนี้
const dailyDraws = new Map<number, DailyDraw>();

// ล้างรายการของวันก่อนๆ ทุกชั่วโมง กันหน่วยความจำโต
setInterval(() => {
  const today = bangkokToday();
  for (const [userId, entry] of dailyDraws) {
    if (entry.date !== today) dailyDraws.delete(userId);
  }
}, 60 * 60 * 1000).unref();

// ตั้ง SIEMSEE_DAILY_LIMIT=off ใน .env เพื่อปิดการจำกัดตอนทดสอบ
function isLimitEnabled(): boolean {
  return process.env.SIEMSEE_DAILY_LIMIT !== 'off';
}

async function pickRandomFortune(): Promise<Fortune | undefined> {
  const [row] = await db.select().from(fortunes).orderBy(sql`RANDOM()`).limit(1);
  return row;
}

// ---------------------------------------------------------------------------
// GET /api/siemsee/draw — สุ่มใบเซียมซี (ต้องล็อกอิน, วันละ 1 ครั้งต่อบัญชี)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// GET /api/siemsee/draw — สุ่มใบเซียมซี (เช็คโควตารายวันจากตารางใหม่)
// ---------------------------------------------------------------------------
router.get('/draw', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    const userId = req.userId!;
    const currentMerit = Number(req.query.currentMerit) || 0;
    const COST = 100; // ค่าใช้จ่ายแต้มสำหรับการสุ่มรอบเสริม

    const rawName = req.query.name;
    const name = typeof rawName === 'string' ? rawName.trim().slice(0, 50) || undefined : undefined;
    const greetingFor = (fortune: Fortune) =>
      name ? `คุณ${name} ได้รับใบที่ ${fortune.number}` : undefined;

    const today = bangkokToday();
    const nextDrawAt = nextBangkokMidnight().toISOString();

    // 1. ตรวจสอบใน Database ว่าวันนี้ User คนนี้ใช้สิทธิ์สุ่มฟรีไปหรือยัง
    const [existingDraw] = await db
      .select()
      .from(siemseeDailyDraws)
      .where(sql`${siemseeDailyDraws.userId} = ${userId} AND ${siemseeDailyDraws.drawDate} = ${today}`)
      .limit(1);

    const alreadyDrawnToday = isLimitEnabled() && !!existingDraw;

    if (alreadyDrawnToday) {
      // ถ้าวันนี้สุ่มไปแล้ว ต้องเช็คว่าแต้มพอจะสุ่มรอบเสริม (100 แต้ม) ไหม?
      if (currentMerit < COST) {
        return res.status(400).json({
          success: false,
          message: 'วันนี้คุณสุ่มครบโควตาฟรีแล้ว และแต้มบารมีไม่ถึง 100 แต้มสำหรับสุ่มเพิ่ม',
        });
      }

      // สุ่มใบใหม่รอบเสริม (หักแต้ม)
      const fortune = await pickRandomFortune();
      if (!fortune) {
        return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลใบเซียมซีในฐานข้อมูล' });
      }

      const remainingMerit = currentMerit - COST;
      const greeting = greetingFor(fortune);

      return res.json({
        success: true,
        alreadyDrawn: true,
        usedMerit: true,
        remainingMerit,
        message: 'ใช้ 100 แต้มบารมีสุ่มเซียมซีรอบเสริมสำเร็จ',
        nextDrawAt,
        data: fortune,
        ...(greeting && { greeting }),
      });
    }

    // 2. กรณีสุ่มครั้งแรกของวัน (สุ่มฟรี)
    const fortune = await pickRandomFortune();
    if (!fortune) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลใบเซียมซีในฐานข้อมูล' });
    }

    // บันทึกลงตารางโควตารายวันว่าวันนี้ได้สิทธิ์สุ่มฟรีแล้ว
    if (isLimitEnabled()) {
      await db.insert(siemseeDailyDraws).values({
        userId,
        drawDate: today,
      });
    }

    const greeting = greetingFor(fortune);
    return res.json({
      success: true,
      alreadyDrawn: false,
      remainingMerit: currentMerit,
      nextDrawAt,
      data: fortune,
      ...(greeting && { greeting }),
    });

  } catch (error) {
    console.error('Error drawing fortune:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
// ---------------------------------------------------------------------------
// POST /api/siemsee/save — บันทึกประวัติใบเซียมซี (เก็บใบเซียมซี)
// (รวมจากสองบล็อกเดิมที่ซ้ำกัน ใช้ข้อความตอบกลับของบล็อกแรกที่ทำงานอยู่จริงก่อนหน้านี้)
// ---------------------------------------------------------------------------
router.post('/save', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const fortuneId = Number(req.body?.fortuneId);
    if (!Number.isInteger(fortuneId)) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุ fortuneId' });
    }

    const exists = await db
      .select({ id: fortunes.id })
      .from(fortunes)
      .where(eq(fortunes.id, fortuneId))
      .limit(1);

    if (exists.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบใบเซียมซีนี้' });
    }

    await db.insert(siemseeHistories).values({
      userId: req.userId!,
      fortuneId,
    });

    return res.status(201).json({ success: true, message: 'บันทึกใบเซียมซีเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error saving fortune history:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// DELETE /api/siemsee/history/:id — ทิ้ง/ลบใบเซียมซีออกจากประวัติ
router.delete('/history/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const historyId = Number(req.params.id);

    if (!historyId || isNaN(historyId)) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุ history id ให้ถูกต้อง' });
    }

    const deleted = await db
      .delete(siemseeHistories)
      .where(sql`${siemseeHistories.id} = ${historyId} AND ${siemseeHistories.userId} = ${userId}`)
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายการที่ต้องการลบ หรือไม่มีสิทธิ์ลบ' });
    }

    return res.json({ success: true, message: 'ทิ้งใบเซียมซีเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Delete siemsee history error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /api/siemsee/fortunes
router.get('/fortunes', async (_req: Request, res: Response) => {
  try {
    const allFortunes = await db.select().from(fortunes);

    return res.json({
      success: true,
      total: allFortunes.length,
      data: allFortunes,
    });
  } catch (error) {
    console.error('Error fetching all fortunes:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /api/siemsee/:number
router.get('/:number', async (req: Request, res: Response) => {
  try {
    const fortuneNumber = Number(req.params.number);

    if (isNaN(fortuneNumber)) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุเลขใบเซียมซีเป็นตัวเลข' });
    }

    const fortuneList = await db
      .select()
      .from(fortunes)
      .where(eq(fortunes.number, fortuneNumber))
      .limit(1);

    if (fortuneList.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบข้อมูลใบเซียมซีหมายเลข ${fortuneNumber}`,
      });
    }

    return res.json({
      success: true,
      data: fortuneList[0],
    });
  } catch (error) {
    console.error(`Error fetching fortune #${req.params.number}:`, error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;