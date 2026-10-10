import { Router } from 'express';
import type { Response } from 'express';
import { dbClient as db } from '../../db/client.js';
import { reviews, temples, users } from '../../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import type { AdminRequest } from '../../middlewares/roles.js';
import { logAudit } from '../../utils/audit.js';

const router = Router();

// GET /api/admin/reviews — ดูรายการรีวิวทั้งหมด
router.get('/', async (req: AdminRequest, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const rows = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userId: reviews.userId,
        userName: users.name,
        templeId: reviews.templeId,
        templeName: temples.name,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(temples, eq(reviews.templeId, temples.id))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return res.json({ success: true, page, limit, data: rows });
  } catch (error) {
    console.error('List reviews error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// DELETE /api/admin/reviews/:id — ลบรีวิวและคำนวณ ratingAvg ของวัดใหม่
router.delete('/:id', async (req: AdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: 'id ต้องเป็นตัวเลข' });

    const [review] = await db
      .select({ id: reviews.id, templeId: reviews.templeId, rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);

    if (!review) return res.status(404).json({ success: false, message: 'ไม่พบรีวิวนี้' });

    const templeId = review.templeId;
    await db.delete(reviews).where(eq(reviews.id, id));

    const [statsResult] = await db
      .select({
        avgRating: sql<number>`coalesce(avg(${reviews.rating}), 0)`,
      })
      .from(reviews)
      .where(eq(reviews.templeId, templeId));

    const newAvg = Number(statsResult?.avgRating || 0);

    await db
      .update(temples)
      .set({ ratingAvg: newAvg })
      .where(eq(temples.id, templeId));

    await logAudit(req, 'review.delete', 'review', id, { templeId, deletedRating: review.rating });

    return res.json({
      success: true,
      message: 'ลบรีวิวสำเร็จ',
      data: { id, templeId, newRatingAvg: newAvg },
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;