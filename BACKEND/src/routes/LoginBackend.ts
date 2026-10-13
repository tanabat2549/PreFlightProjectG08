import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { dbClient } from '../db/client.js';
import { users } from '../db/schema.js';
import axios from 'axios';
import { requireAuth, type AuthRequest } from '../middlewares/requireAuth.js';
const router = express.Router();
function jwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set');
  return s;
}

router.post('/auth/google', async (req, res) => {
  // 🟢 1. ดักรับค่าทั้ง camelCase และ snake_case จาก Frontend
  const token = req.body.token || req.body.idToken || req.body.id_token;
  const accessToken = req.body.accessToken || req.body.access_token;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!token && !accessToken) {
    return res.status(400).json({ 
      success: false, 
      message: 'Token or accessToken is required in request body' 
    });
  }

  if (!clientId) {
    console.error('❌ Error: GOOGLE_CLIENT_ID is not defined in .env');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  let googleId: string;
  let email: string;
  let name: string | undefined;
  let picture: string | undefined;

  // 🟢 2. ยืนยันตัวตนกับ Google
  try {
    if (accessToken) {
      console.log('🔑 Validating accessToken with Google...');
      const googleRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      googleId = googleRes.data.id || googleRes.data.sub;
      email = googleRes.data.email;
      name = googleRes.data.name;
      picture = googleRes.data.picture;
    } else {
      console.log('🔑 Validating idToken with Google...');
      const googleClient = new OAuth2Client(clientId);
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        return res.status(400).json({ success: false, message: 'Invalid token payload' });
      }

      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    }
  } catch (googleError: any) {
    console.error('❌ Google Token Validation Error:', googleError?.response?.data || googleError?.message);
    return res.status(401).json({
      success: false,
      message: 'Google token validation failed. Check if token is expired or Client ID matches.',
      error: googleError?.response?.data || googleError?.message,
    });
  }

  // 🟢 3. จัดการ Database & JWT
  try {
    console.log(`👤 Google User Authenticated: ${email} (${googleId})`);

    let existingUser = await dbClient.query.users.findFirst({
      where: eq(users.googleId, googleId),
    });

    if (!existingUser) {
      existingUser = await dbClient.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });
    }

    // บัญชีที่ถูกล็อกโดย Super Admin ห้ามเข้าสู่ระบบ
    if (existingUser && !existingUser.isActive) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_LOCKED',
        message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
      });
    }

    let user;

    if (!existingUser) {
      console.log('➕ Creating new user in DB...');
      const [newUser] = await dbClient.insert(users).values({
        name: name || 'Google User',
        email: email.toLowerCase(),
        googleId: googleId,
        picture: picture,
      }).returning();
      user = newUser;
    } else {
      console.log('🔄 Updating existing user in DB...');
      // 🌟 หากผู้ใช้เคยมีชื่อใน Database (หรือเคยเปลี่ยนชื่อ) ให้ใช้ชื่อจาก Database เดิมเสมอ ห้ามเอาชื่อ Google มาทับ
      const customDbName = existingUser.name?.trim() ? existingUser.name : (name || 'Google User');

      const [updatedUser] = await dbClient.update(users)
        .set({
          googleId: googleId,
          picture: picture || existingUser.picture,
          name: customDbName,
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      user = updatedUser;
    }

    const appToken = jwt.sign(
      { userId: user.id, email: user.email },
  jwtSecret(),
  { expiresIn: '7d' }
    );

    console.log('✅ Login Successful!');
    return res.json({
      success: true,
      token: appToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
      },
    });

  } catch (dbError: any) {
    console.error('❌ Database Operation Error:', dbError);
    return res.status(500).json({
      success: false,
      message: 'Database error occurred during user creation/update',
      error: dbError?.message,
    });
  }
});
// ⚠️ สำหรับพัฒนาเท่านั้น: endpoint นี้ออก JWT ให้ทุกอีเมลโดยไม่ต้องยืนยันตัวตน
// (รวมถึงบัญชี superadmin) จึงปิดเป็นค่าเริ่มต้น และเปิดได้เฉพาะเมื่อตั้ง
// ENABLE_DEV_TOKEN=true ใน .env ของเครื่อง dev และ NODE_ENV ต้องไม่ใช่ production
router.post('/auth/dev-token', async (req, res) => {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEV_TOKEN !== 'true') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  const { email } = req.body;

  // หา user จากอีเมล
  const user = await dbClient.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, code: 'ACCOUNT_LOCKED', message: 'บัญชีนี้ถูกระงับการใช้งาน' });
  }

  // สร้าง JWT Token ให้ทันที
  const appToken = jwt.sign(
    { userId: user.id, email: user.email },
  jwtSecret(),
  { expiresIn: '7d' }
  );

  return res.json({ success: true, token: appToken });
});

router.post('/auth/logout', (req, res) => {
  return res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

// เช็กว่า token ยังใช้ได้ไหม (ผู้ใช้ถูกลบ/ล็อก จะได้ 401/403 จาก requireAuth)
router.get('/session', requireAuth, (req: AuthRequest, res) => {
  return res.json({ success: true, data: req.actor });
});

export default router;