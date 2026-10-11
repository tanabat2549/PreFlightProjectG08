import { Router } from 'express';
import type { Response } from 'express';
import { dbClient as db } from '../../db/client.js';
import { users } from '../../db/schema.js';
import { and, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { ALL_ROLES, type AdminRequest } from '../../middlewares/roles.js';
import { logAudit } from '../../utils/audit.js';

// Router นี้ถูก mount ที่ /api/admin/users
// (requireAuth + requireSuperAdmin ถูกบังคับใช้แล้วใน admin/index.ts)
const router = Router();

type Role = (typeof users.role.enumValues)[number];

// 1. GET /api/admin/users — รายชื่อผู้ใช้ (รองรับ ?page= &limit= &q= &role=)
router.get('/', async (req: AdminRequest, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const role = typeof req.query.role === 'string' ? req.query.role : '';

    const conditions: SQL[] = [];

    if (q) {
      const pattern = `%${q}%`;
      conditions.push(or(ilike(users.name, pattern), ilike(users.email, pattern))!);
    }

    if (role) {
      if (!ALL_ROLES.includes(role)) {
        return res.status(400).json({ success: false, message: `role ต้องเป็น ${ALL_ROLES.join(' / ')}` });
      }
      conditions.push(eq(users.role, role as Role));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(users)
      .where(where);

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        picture: users.picture,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(users.id)
      .limit(limit)
      .offset((page - 1) * limit);

    return res.json({ success: true, page, limit, total, data: rows });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 2. PATCH /api/admin/users/:id/role — เปลี่ยน Role ผู้ใช้งาน
router.patch('/:id/role', async (req: AdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const role = req.body?.role;

    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: 'id ต้องเป็นตัวเลข' });
    if (!ALL_ROLES.includes(role)) return res.status(400).json({ success: false, message: `role ต้องเป็น ${ALL_ROLES.join(' / ')}` });
    if (id === req.actor!.id) return res.status(400).json({ success: false, message: 'ไม่สามารถเปลี่ยน role ของตัวเองได้' });

    const [before] = await db.select({ role: users.role }).from(users).where(eq(users.id, id)).limit(1);
    if (!before) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้นี้' });

    const [updated] = await db.update(users).set({ role: role as Role }).where(eq(users.id, id)).returning();
    await logAudit(req, 'user.role.change', 'user', id, { from: before.role, to: role });

    return res.json({ success: true, data: { id: updated.id, name: updated.name, role: updated.role } });
  } catch (error) {
    console.error('Change role error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 3. PATCH /api/admin/users/:id/active — ล็อก/ปลดล็อกบัญชี
router.patch('/:id/active', async (req: AdminRequest, res: Response) => {
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

// 4. DELETE /api/admin/users/:id — ลบผู้ใช้งานออกจากระบบ
// หมายเหตุ: เป็น hard delete — รีวิวและประวัติเซียมซีของผู้ใช้จะถูกลบตาม (cascade)
// ถ้าแค่ต้องการระงับการใช้งาน ให้ใช้ PATCH /:id/active แทน
router.delete('/:id', async (req: AdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: 'id ต้องเป็นตัวเลข' });
    }

    if (req.actor && req.actor.id === id) {
      return res.status(400).json({ success: false, message: 'ไม่สามารถลบบัญชีของตนเองได้' });
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานนี้ในระบบ' });
    }

    await logAudit(req, 'user.delete', 'user', id, { email: deletedUser.email, name: deletedUser.name });

    return res.json({
      success: true,
      message: `ลบผู้ใช้งาน ${deletedUser.email} เรียบร้อยแล้ว`,
      data: { id: deletedUser.id, email: deletedUser.email },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
