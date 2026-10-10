import { Router } from 'express';
import type { Response } from 'express';
import { dbClient as db } from '../../db/client.js';
import { temples } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import type { AdminRequest } from '../../middlewares/roles.js';
import { logAudit } from '../../utils/audit.js';

const router = Router();

// GET /api/admin/temples — ดูรายชื่อวัดทั้งหมด
router.get('/', async (req: AdminRequest, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const rows = await db
      .select()
      .from(temples)
      .limit(limit)
      .offset((page - 1) * limit);

    return res.json({ success: true, page, limit, data: rows });
  } catch (error) {
    console.error('List temples error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/admin/temples — เพิ่มวัดใหม่
router.post('/', async (req: AdminRequest, res: Response) => {
  try {
    const { googlePlaceId, name, description, address, latitude, longitude, openTime, closeTime, imageUrl } = req.body;
    
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อวัด พิกัดละติจูด และลองจิจูดให้ครบถ้วน' });
    }

    const [newTemple] = await db
      .insert(temples)
      .values({ 
        googlePlaceId: googlePlaceId || null,
        name, 
        description: description || null, 
        address: address || null, 
        latitude: Number(latitude),
        longitude: Number(longitude),
        openTime: openTime || null,
        closeTime: closeTime || null,
        imageUrl: imageUrl || null,
        ratingAvg: 0,
        ratingCount: 0
      })
      .returning();

    await logAudit(req, 'temple.create', 'temple', newTemple.id, { name });

    return res.status(201).json({ success: true, data: newTemple });
  } catch (error) {
    console.error('Create temple error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// PATCH /api/admin/temples/:id — แก้ไขข้อมูลวัด
router.patch('/:id', async (req: AdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: 'id ต้องเป็นตัวเลข' });

    const { googlePlaceId, name, description, address, latitude, longitude, openTime, closeTime, imageUrl } = req.body;

    const [updated] = await db
      .update(temples)
      .set({
        ...(googlePlaceId !== undefined && { googlePlaceId }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(latitude !== undefined && { latitude: Number(latitude) }),
        ...(longitude !== undefined && { longitude: Number(longitude) }),
        ...(openTime !== undefined && { openTime }),
        ...(closeTime !== undefined && { closeTime }),
        ...(imageUrl !== undefined && { imageUrl }),
      })
      .where(eq(temples.id, id))
      .returning();

    if (!updated) return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลวัดนี้' });

    await logAudit(req, 'temple.update', 'temple', id);

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update temple error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// DELETE /api/admin/temples/:id — ลบวัด
router.delete('/:id', async (req: AdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: 'id ต้องเป็นตัวเลข' });

    const [deleted] = await db.delete(temples).where(eq(temples.id, id)).returning();
    if (!deleted) return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลวัดนี้' });

    await logAudit(req, 'temple.delete', 'temple', id, { name: deleted.name });

    return res.json({ success: true, message: 'ลบวัดสำเร็จ', data: { id } });
  } catch (error) {
    console.error('Delete temple error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;