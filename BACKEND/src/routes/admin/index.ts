import { Router } from 'express';
import type { Response } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireSuperAdmin, type AdminRequest } from '../../middlewares/roles.js';

// นำเข้า Router ย่อยของแอดมินแต่ละส่วน
import userRoutes from './superAdminBackend.js';
import auditLogRoutes from './auditLogs.js';
import statsRoutes from './stats.js';
import fortuneRoutes from './fortunes.js';
import reviewRoutes from './reviews.js';
import templeRoutes from './temples.js';
import calendarRoutes from './calendars.js';

const router = Router();

// บังคับใช้ Middleware ตรวจสอบการล็อกอินและสิทธิ์ Super Admin กับทุก Route ใน /api/admin
router.use(requireAuth as any);
router.use(requireSuperAdmin as any);

// GET /api/admin/me — ให้ frontend เช็กว่าผู้ใช้ปัจจุบันเป็น superadmin จริงหรือไม่
// (ถ้าไม่ใช่จะได้ 401/403 จาก middleware ด้านบนก่อนถึงตรงนี้)
router.get('/me', (req: AdminRequest, res: Response) => {
  return res.json({ success: true, data: req.actor });
});

router.use('/users', userRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/stats', statsRoutes);
router.use('/fortunes', fortuneRoutes);
router.use('/reviews', reviewRoutes);
router.use('/temples', templeRoutes);
router.use('/calendars', calendarRoutes);

export default router;
