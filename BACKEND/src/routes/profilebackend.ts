import { Router, type Response, type Request } from 'express';
import { dbClient } from '../db/client.js';
import { users, reviews, temples, siemseeHistories, fortunes } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, type AuthRequest} from '../middlewares/requireAuth.js'

const router = Router();

// ==========================================
// 1. GET /api/user/profile/:email
// ดึงข้อมูลโปรไฟล์ล่าสุดของผู้ใช้งาน
// ==========================================
router.get('/profile/:email', async (req: Request, res: Response): Promise<any> => {
  try {
    const email  = req.params.email as string;

    if (!email) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุอีเมล' });
    }

    // ค้นหาผู้ใช้จากฐานข้อมูล
    const userResult = await dbClient.select().from(users).where(eq(users.email, email)).limit(1);

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานในระบบ' });
    }

    const foundUser = userResult[0];

    // ส่งข้อมูลกลับไปให้ Frontend ตาม Interface UserData
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
        bio: foundUser.blessing            
      }
    });

  } catch (error) {
    console.error('Fetch profile error:', error);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});

// ==========================================
// 2. PUT /api/user/profile
// อัปเดตข้อมูลดวงชะตาและโปรไฟล์
// ==========================================
router.put('/profile', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name, gender, birthDayOfWeek, birthday, bio } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'ไม่พบอีเมลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่' });
    }

    // จัดฟอร์แมตวันที่ (ถ้า Frontend ส่งมาเป็นว่างๆ หรือ undefined จะได้เซ็ตเป็น null)
    let formattedDate = null;
    if (birthday && birthday.trim() !== '') {
      formattedDate = new Date(birthday).toISOString().split('T')[0];
    }

    const updatedUserResult = await dbClient.update(users)
      .set({
        name: name,
        sex: gender || null,              
        weekdaydate: birthDayOfWeek || null, 
        birthDate: formattedDate,         
        blessing: bio || null,            
      })
      .where(eq(users.email, email)) 
      .returning();

    if (!updatedUserResult || updatedUserResult.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานในระบบ' });
    }

    const updatedUser = updatedUserResult[0];

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
        bio: updatedUser.blessing            
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
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

export default router;