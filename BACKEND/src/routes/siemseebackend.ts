import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbClient as db } from '../db/client.js';
import { fortunes, siemseeHistories } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { requireAuth, type AuthRequest} from '../middlewares/requireAuth.ts'

const router = Router();

// GET /api/siemsee/draw
router.get('/draw', async (_req: Request, res: Response) => {
  try {
    const fortuneList = await db
      .select()
      .from(fortunes)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (fortuneList.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลใบเซียมซีในฐานข้อมูล' });
    }

    return res.json({ success: true, data: fortuneList[0] });
  } catch (error) {
    console.error('Error drawing fortune:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/siemsee/save — กด "เก็บใบเซียมซี" ถึงจะบันทึกลงประวัติ
// (การ "ทิ้งเซียมซี" ไม่ต้องมี API เพราะยังไม่มีอะไรถูกเก็บ)
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

    return res.status(201).json({ success: true, message: 'เก็บใบเซียมซีเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Save siemsee error:', error);
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