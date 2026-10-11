import { Router } from 'express';
import type { Response } from 'express';
import { dbClient as db } from '../../db/client.js';
import { fortunes } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import type { AdminRequest } from '../../middlewares/roles.js';
import { logAudit } from '../../utils/audit.js';

const router = Router();

// GET /api/admin/fortunes — ดึงรายการเซียมซีทั้งหมด
router.get('/', async (req: AdminRequest, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const rows = await db
      .select()
      .from(fortunes)
      .orderBy(fortunes.number)
      .limit(limit)
      .offset((page - 1) * limit);

    return res.json({ success: true, page, limit, data: rows });
  } catch (error) {
    console.error('List fortunes error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/admin/fortunes — เพิ่มใบเซียมซีใหม่
router.post('/', async (req: AdminRequest, res: Response) => {
  try {
    const { number, title, workFortune, loveFortune, moneyFortune, studyFortune, healthFortune } = req.body;
    
    if (number === undefined || !title) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกหมายเลขและชื่อหัวข้อใบเซียมซี' });
    }

    const [newFortune] = await db
      .insert(fortunes)
      .values({ 
        number, 
        title, 
        workFortune: workFortune || '', 
        loveFortune: loveFortune || '', 
        moneyFortune: moneyFortune || '', 
        studyFortune: studyFortune || '', 
        healthFortune: healthFortune || '' 
      })
      .returning();

    await logAudit(req, 'fortune.create', 'fortune', newFortune.id, { number });

    return res.status(201).json({ success: true, data: newFortune });
  } catch (error) {
    console.error('Create fortune error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// PATCH /api/admin/fortunes/:id — แก้ไขใบเซียมซี
router.patch('/:id', async (req: AdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: 'id ต้องเป็นตัวเลข' });

    const { number, title, workFortune, loveFortune, moneyFortune, studyFortune, healthFortune } = req.body;
    
    const [updated] = await db
      .update(fortunes)
      .set({
        ...(number !== undefined && { number }),
        ...(title !== undefined && { title }),
        ...(workFortune !== undefined && { workFortune }),
        ...(loveFortune !== undefined && { loveFortune }),
        ...(moneyFortune !== undefined && { moneyFortune }),
        ...(studyFortune !== undefined && { studyFortune }),
        ...(healthFortune !== undefined && { healthFortune }),
      })
      .where(eq(fortunes.id, id))
      .returning();

    if (!updated) return res.status(404).json({ success: false, message: 'ไม่พบใบเซียมซีนี้' });

    await logAudit(req, 'fortune.update', 'fortune', id);

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update fortune error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// DELETE /api/admin/fortunes/:id — ลบใบเซียมซี
router.delete('/:id', async (req: AdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: 'id ต้องเป็นตัวเลข' });

    const [deleted] = await db.delete(fortunes).where(eq(fortunes.id, id)).returning();
    if (!deleted) return res.status(404).json({ success: false, message: 'ไม่พบใบเซียมซีนี้' });

    await logAudit(req, 'fortune.delete', 'fortune', id, { number: deleted.number });

    return res.json({ success: true, message: 'ลบใบเซียมซีสำเร็จ', data: { id } });
  } catch (error) {
    console.error('Delete fortune error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;