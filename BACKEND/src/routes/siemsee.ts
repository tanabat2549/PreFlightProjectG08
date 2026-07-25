import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbClient as db } from '../db/client.js';
import { fortunes } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/siemsee/draw
router.get('/draw', async (req: Request, res: Response) => {
  try {
    // 1. สุ่มตัวเลข 1 ถึง 17
    const randomNumber = Math.floor(Math.random() * 17) + 1;

    // 2. ดึงข้อมูลคำทำนาย
    const fortuneList = await db
      .select()
      .from(fortunes)
      .where(eq(fortunes.number, randomNumber));

    if (fortuneList.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลใบเซียมซีในฐานข้อมูล' });
    }

    const fortune = fortuneList[0];

    // 3. ส่งข้อมูลกลับ
    return res.json({
      success: true,
      data: fortune
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;