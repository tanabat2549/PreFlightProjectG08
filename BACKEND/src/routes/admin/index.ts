import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireSuperAdmin } from '../../middlewares/roles.js';

// นำเข้า Router ย่อยของแอดมินแต่ละส่วนที่เราสร้างไว้
import userRoutes from './superAdminBackend.ts';
import fortuneRoutes from './fortunes.js';
import reviewRoutes from './reviews.js';
import templeRoutes from './temples.js';
import calendarRoutes from './calendars.js';

const router = Router();

// บังคับใช้ Middleware ตรวจสอบการล็อกอินและสิทธิ์ Super Admin กับทุก Route ใน /api/admin
router.use(requireAuth as any);
router.use(requireSuperAdmin as any);

router.use('/users', userRoutes);
router.use('/fortunes', fortuneRoutes);
router.use('/reviews', reviewRoutes);
router.use('/temples', templeRoutes);
router.use('/calendars', calendarRoutes);

export default router;