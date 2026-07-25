import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbClient as db } from '../db/client.js';
import { fortunes, siemseeHistories } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
const router = Router();
// GET /api/siemsee/draw
router.get('/draw', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ message: 'โปรดระบุ User ID' });
    }

    const randomNumber = Math.floor(Math.random() * 17) + 1;
    const fortuneList = await db
      .select()
      .from(fortunes)
      .where(eq(fortunes.number, randomNumber));

    if (fortuneList.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลใบเซียมซี' });
    }

    const fortune = fortuneList[0];

    await db.insert(siemseeHistories).values({
      userId,
      fortuneId: fortune.id,
    });

    // 3. ส่งข้อมูลกลับไปให้ Frontend
    return res.json({
      success: true,
      data: fortune
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;