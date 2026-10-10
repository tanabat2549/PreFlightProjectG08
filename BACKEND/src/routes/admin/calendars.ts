import { Router } from 'express';
import type { Response } from 'express';
import { dbClient as db } from '../../db/client.js';
import { auspiciousDays } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import type { AdminRequest } from '../../middlewares/roles.js';

const router = Router();

// 1. GET /api/admin/calendars — ดูรายการวันพระ/วันมงคลทั้งหมด
router.get('/', async (_req: AdminRequest, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(auspiciousDays)
      .orderBy(desc(auspiciousDays.date));

    return res.json({ success: true, total: rows.length, data: rows });
  } catch (error) {
    console.error('List auspicious days error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 2. POST /api/admin/calendars — เพิ่มวันพระ/วันมงคลใหม่
router.post('/', async (req: AdminRequest, res: Response) => {
  try {
    const { date, title, isBuddhaDay, isAuspiciousDay, recommendedActivities } = req.body;

    if (!date || !title) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุ date และ title' });
    }

    const dateString = typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0];

    const [created] = await db
      .insert(auspiciousDays)
      .values({
        date: dateString,
        title,
        isBuddhaDay: isBuddhaDay !== undefined ? Boolean(isBuddhaDay) : false,
        isAuspiciousDay: isAuspiciousDay !== undefined ? Boolean(isAuspiciousDay) : false,
        recommendedActivities: recommendedActivities || null,
      })
      .returning();

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Create auspicious day error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 3. PUT /api/admin/calendars/:id — แก้ไขวันพระ/วันมงคล
router.put('/:id', async (req: AdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { date, title, isBuddhaDay, isAuspiciousDay, recommendedActivities } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: 'id ต้องเป็นตัวเลข' });
    }

    const updateData: Record<string, any> = {};
    if (date !== undefined) {
      updateData.date = typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0];
    }
    if (title !== undefined) updateData.title = title;
    if (isBuddhaDay !== undefined) updateData.isBuddhaDay = Boolean(isBuddhaDay);
    if (isAuspiciousDay !== undefined) updateData.isAuspiciousDay = Boolean(isAuspiciousDay);
    if (recommendedActivities !== undefined) updateData.recommendedActivities = recommendedActivities;

    const [updated] = await db
      .update(auspiciousDays)
      .set(updateData)
      .where(eq(auspiciousDays.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายการนี้' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update auspicious day error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 4. DELETE /api/admin/calendars/:id — ลบวันพระ/วันมงคล
router.delete('/:id', async (req: AdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: 'id ต้องเป็นตัวเลข' });
    }

    const [deleted] = await db
      .delete(auspiciousDays)
      .where(eq(auspiciousDays.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายการนี้' });
    }

    return res.json({ success: true, message: 'ลบรายการเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Delete auspicious day error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;