import { Router } from 'express';
import type { Response } from 'express';
import { dbClient as db } from '../db/client.js';
import { users, auditLogs } from '../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireSuperAdmin, ALL_ROLES, type AdminRequest } from '../middlewares/roles.js';
import { logAudit } from '../utils/audit.js';


const router = Router();

// ยืนยัน ตัวตนผ่าน JWT ก่อนเข้าทุก API Route ใน Admin
router.use(requireAuth as any);

// 1. GET /api/admin/users — รายชื่อผู้ใช้ทั้งหมด
router.get('/users', requireSuperAdmin, async (_req: AdminRequest, res: Response) => {
  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.id);

    return res.json({ success: true, total: rows.length, data: rows });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 2. PATCH /api/admin/users/:id/role — เปลี่ยน Role ผู้ใช้งาน
router.patch('/users/:id/role', requireSuperAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const role = req.body?.role;

    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: 'id ต้องเป็นตัวเลข' });
    if (!ALL_ROLES.includes(role)) return res.status(400).json({ success: false, message: `role ต้องเป็น ${ALL_ROLES.join(' / ')}` });
    if (id === req.actor!.id) return res.status(400).json({ success: false, message: 'ไม่สามารถเปลี่ยน role ของตัวเองได้' });

    const [before] = await db.select({ role: users.role }).from(users).where(eq(users.id, id)).limit(1);
    if (!before) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้นี้' });

    const [updated] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    await logAudit(req, 'user.role.change', 'user', id, { from: before.role, to: role });

    return res.json({ success: true, data: { id: updated.id, name: updated.name, role: updated.role } });
  } catch (error) {
    console.error('Change role error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 3. PATCH /api/admin/users/:id/active — ล็อก/ปลดล็อกบัญชี
router.patch('/users/:id/active', requireSuperAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const isActive = req.body?.isActive;

    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: 'id ต้องเป็นตัวเลข' });
    if (typeof isActive !== 'boolean') return res.status(400).json({ success: false, message: 'isActive ต้องเป็น boolean' });
    if (id === req.actor!.id) return res.status(400).json({ success: false, message: 'ไม่สามารถล็อกบัญชีตัวเองได้' });

    const [updated] = await db.update(users).set({ isActive }).where(eq(users.id, id)).returning();
    if (!updated) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้นี้' });

    await logAudit(req, isActive ? 'user.unlock' : 'user.lock', 'user', id);
    return res.json({ success: true, data: { id: updated.id, isActive: updated.isActive } });
  } catch (error) {
    console.error('Toggle active error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 4. GET /api/admin/audit-logs — ดูประวัติการใช้งาน
router.get('/audit-logs', requireSuperAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const rows = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        targetType: auditLogs.targetType,
        targetId: auditLogs.targetId,
        details: auditLogs.details,
        ip: auditLogs.ip,
        createdAt: auditLogs.createdAt,
        actorId: auditLogs.actorId,
        actorName: users.name,
        actorEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return res.json({ success: true, page, limit, data: rows });
  } catch (error) {
    console.error('Audit logs error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 5. GET /api/admin/stats — ดูสถิติภาพรวมระบบ
router.get('/stats', requireSuperAdmin, async (_req: AdminRequest, res: Response) => {
  try {
    const byRole = await db
      .select({ role: users.role, count: sql<number>`count(*)::int` })
      .from(users)
      .groupBy(users.role);

    return res.json({
      success: true,
      data: {
        usersByRole: byRole,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;