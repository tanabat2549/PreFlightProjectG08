import { Router } from 'express';
import type { Response } from 'express';
import { dbClient as db } from '../../db/client.js';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import type { AuthRequest } from '../../middlewares/requireAuth.js';

const router = Router();

// 1. GET /api/admin/users — ดึงรายชื่อผู้ใช้ทั้งหมด
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
    }).from(users);

    return res.json({ success: true, total: allUsers.length, data: allUsers });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 2. DELETE /api/admin/users/:id — ลบผู้ใช้งานออกจากระบบ
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: 'id ต้องเป็นตัวเลข' });
    }

    // ป้องกันไม่ให้ Super Admin เผลอลบไอดีตัวเอง (ทางเลือกเสริมเพื่อความปลอดภัย)
   if (req.actor && req.actor.id === id) {
      return res.status(400).json({ success: false, message: 'ไม่สามารถลบบัญชีของตนเองได้' });
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
      });

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานนี้ในระบบ' });
    }

    return res.json({
      success: true,
      message: `ลบผู้ใช้งาน ${deletedUser.email} เรียบร้อยแล้ว`,
      data: deletedUser,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;