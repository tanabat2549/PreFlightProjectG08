import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbClient as db } from '../db/client.js';
import { fortunes } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// GET /api/siemsee/draw
router.get('/draw', async (req: Request, res: Response) => {
  try {
    // ให้ Database สุ่มรายการมา 1 รายการโดยตรง (ใช้ได้กับ Postgres, MySQL, SQLite)
    const fortuneList = await db
      .select()
      .from(fortunes)
      .orderBy(sql`RANDOM()`) // หรือ RAND() หากใช้ MySQL
      .limit(1);

    if (fortuneList.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลใบเซียมซีในฐานข้อมูล' });
    }

    return res.json({
      success: true,
      data: fortuneList[0]
    });
  } catch (error) {
    console.error('Error drawing fortune:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /api/siemsee/fortunes
router.get('/fortunes', async (req: Request, res: Response) => {
  try {
    const allFortunes = await db.select().from(fortunes);

    return res.json({
      success: true,
      total: allFortunes.length,
      data: allFortunes
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
        message: `ไม่พบข้อมูลใบเซียมซีหมายเลข ${fortuneNumber}`
      });
    }

    return res.json({
      success: true,
      data: fortuneList[0]
    });
  } catch (error) {
    console.error(`Error fetching fortune #${req.params.number}:`, error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;