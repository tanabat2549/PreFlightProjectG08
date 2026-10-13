import { Router, type Response, type Request } from 'express';
import { dbClient } from '../db/client.js';
import { users, reviews, temples, siemseeHistories, fortunes } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { requireAuth, type AuthRequest} from '../middlewares/requireAuth.js'

const router = Router();
// ==========================================
// 1. GET /api/user/profile/:email
// ดึงข้อมูลโปรไฟล์ล่าสุดของผู้ใช้งาน
// ==========================================
router.get('/profile/:email', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const [foundUser] = await dbClient.select().from(users).where(eq(users.id, req.userId!)).limit(1);

    if (!foundUser) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานในระบบ' });
    }

    const totalDraws = 'totalDraws' in foundUser ? Number((foundUser as any).totalDraws ?? 0) : 0;
    const points = 'points' in foundUser ? Number((foundUser as any).points ?? 0) : 0;
    return res.json({
      success: true,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        picture: foundUser.picture,
        gender: foundUser.sex,
        birthDayOfWeek: foundUser.weekdaydate,
        birthday: foundUser.birthDate,
        bio: foundUser.blessing,
        totalDraws,
        points,
      },
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});

// 2. PUT /api/user/profile — อัปเดตเฉพาะโปรไฟล์ของคนที่ล็อกอินอยู่
router.put('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, gender, birthDayOfWeek, birthday, bio } = req.body;

    let formattedDate = null;
    if (birthday && birthday.trim() !== '') {
      formattedDate = new Date(birthday).toISOString().split('T')[0];
    }

    const [updatedUser] = await dbClient.update(users)
      .set({
        name: name,
        sex: gender || null,
        weekdaydate: birthDayOfWeek || null,
        birthDate: formattedDate,
        blessing: bio || null,
      })
      .where(eq(users.id, req.userId!))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานในระบบ' });
    }

    return res.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        picture: updatedUser.picture,
        gender: updatedUser.sex,
        birthDayOfWeek: updatedUser.weekdaydate,
        birthday: updatedUser.birthDate,
        bio: updatedUser.blessing,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  }
});
router.post('/bless', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId!;
    const ADD_POINTS = 50;

    const [currentUser] = await dbClient
      .select({ points: users.points })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งาน' });
    }

    const currentPoints = Number(currentUser.points ?? 0);
    const newPoints = currentPoints + ADD_POINTS;

    await dbClient
      .update(users)
      .set({ points: newPoints })
      .where(eq(users.id, userId));

    return res.json({
      success: true,
      addedPoints: ADD_POINTS,
      totalPoints: newPoints,
      message: 'อนุโมทนาบุญสำเร็จ รับ 50 บารมี',
    });
  } catch (error) {
    console.error('Bless points error:', error);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการรับแต้มบุญ' });
  }
});

// ==========================================
// 🆕 3. GET /api/user/reviews — ดึงรีวิววัดทั้งหมดที่ user คนนี้เคยเขียน
// (join กับ temples เพื่อเอาชื่อวัดมาแสดง)
// ==========================================
router.get('/reviews', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId!;

    const rows = await dbClient
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        templeName: temples.name,
      })
      .from(reviews)
      .innerJoin(temples, eq(reviews.templeId, temples.id))
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));

    const formatted = rows.map((r) => ({
      id: String(r.id),
      temple: r.templeName,
      rating: r.rating,
      comment: r.comment || '',
      date: r.createdAt.toISOString().split('T')[0],
    }));

    return res.json({ success: true, reviews: formatted });
  } catch (error) {
    console.error('Fetch user reviews error:', error);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงรีวิว' });
  }
});


// ==========================================
// 🆕 4. GET /api/user/siemsee-history — ดึงประวัติการเขย่าเซียมซีทั้งหมดของ user
// (join กับ fortunes เพื่อเอารายละเอียดคำทำนายมาแสดง)
// ==========================================
router.get('/siemsee-history', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId!;

    const rows = await dbClient
      .select({
        id: siemseeHistories.id,
        drawnAt: siemseeHistories.drawnAt,
        stickNumber: fortunes.number,
        title: fortunes.title,
        workFortune: fortunes.workFortune,
        loveFortune: fortunes.loveFortune,
        moneyFortune: fortunes.moneyFortune,
        studyFortune: fortunes.studyFortune,
        healthFortune: fortunes.healthFortune,
      })
      .from(siemseeHistories)
      .innerJoin(fortunes, eq(siemseeHistories.fortuneId, fortunes.id))
      .where(eq(siemseeHistories.userId, userId))
      .orderBy(desc(siemseeHistories.drawnAt));

    const formatted = rows.map((r) => ({
      id: String(r.id),
      date: r.drawnAt.toISOString().split('T')[0],
      stickNumber: r.stickNumber,
      title: r.title,
      workFortune: r.workFortune,
      loveFortune: r.loveFortune,
      moneyFortune: r.moneyFortune,
      studyFortune: r.studyFortune,
      healthFortune: r.healthFortune,
    }));

    return res.json({ success: true, history: formatted });
  } catch (error) {
    console.error('Fetch siemsee history error:', error);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงประวัติ' });
  }
});

// ==========================================
// 🆕 5. DELETE /api/user/siemsee-history/:id — ลบ/ทิ้งใบเซียมซีออกจากประวัติ
// ==========================================
router.delete('/siemsee-history/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId!;
    const historyId = Number(req.params.id);

    if (!historyId || isNaN(historyId)) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุ id ให้ถูกต้อง' });
    }

    const deleted = await dbClient
      .delete(siemseeHistories)
      .where(and(eq(siemseeHistories.id, historyId), eq(siemseeHistories.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายการที่ต้องการลบ หรือไม่มีสิทธิ์ลบ' });
    }

    return res.json({ success: true, message: 'ทิ้งใบเซียมซีออกจากประวัติเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Delete siemsee history error:', error);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบประวัติ' });
  }
});

export default router;