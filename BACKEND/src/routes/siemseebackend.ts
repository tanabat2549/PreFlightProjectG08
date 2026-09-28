import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbClient as db } from '../db/client.js';
import { fortunes, siemseeHistories } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { optionalAuth, type AuthRequest} from '../middlewares/optionalAuth.js'

const router = Router();

// GET /api/siemsee/draw
router.get('/draw', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    // ให้ Database สุ่มรายการมา 1 รายการโดยตรง
    const fortuneList = await db
      .select()
      .from(fortunes) // src from database
      .orderBy(sql`RANDOM()`) // สุ่ม
      .limit(1);

    if (fortuneList.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลใบเซียมซีในฐานข้อมูล' });
    }

    const picked = fortuneList[0];

    if (req.userId) {
      try {
        await db.insert(siemseeHistories).values({
          userId: req.userId,
          fortuneId: picked.id,
        });
      } catch (err) {
        console.error('Save siemsee history error:', err);
      }
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