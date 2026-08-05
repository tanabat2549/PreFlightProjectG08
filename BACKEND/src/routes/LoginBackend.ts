import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { dbClient } from '../db/client.js';
import { users } from '../db/schema.js';
import axios from 'axios';

const router = express.Router();

router.post('/auth/google', async (req, res) => {
  const { token, accessToken } = req.body;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!token && !accessToken) {
    return res.status(400).json({ success: false, message: 'Token or accessToken is required' });
  }

  if (!clientId) {
    console.error('❌ Error: GOOGLE_CLIENT_ID is not defined in .env');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  try {
    let googleId: string;
    let email: string;
    let name: string | undefined;
    let picture: string | undefined;

    // 🟢 กรณี Custom Button (accessToken)
    if (accessToken) {
      console.log('🔑 Validating accessToken with Google...');
      const googleRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      googleId = googleRes.data.id || googleRes.data.sub;
      email = googleRes.data.email;
      name = googleRes.data.name;
      picture = googleRes.data.picture;
    } 
    // 🟡 กรณี Google Login Iframe (idToken)
    else if (token) {
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
    } else {
      return res.status(400).json({ success: false, message: 'Invalid token state' });
    }

    console.log(`👤 Google User Authenticated: ${email} (${googleId})`);

    // 2. ค้นหาผู้ใช้ใน Database
    let existingUser = await dbClient.query.users.findFirst({
      where: eq(users.googleId, googleId),
    });

    if (!existingUser) {
      existingUser = await dbClient.query.users.findFirst({
        where: eq(users.email, email),
      });
    }

    let user;

    if (!existingUser) {
      console.log('➕ Creating new user in DB...');
      const [newUser] = await dbClient.insert(users).values({
        name: name || 'Google User',
        email: email,
        googleId: googleId,
        picture: picture,
      }).returning();
      user = newUser;
    } else {
      console.log('🔄 Updating existing user in DB...');
      const [updatedUser] = await dbClient.update(users)
        .set({
          googleId: googleId,
          picture: picture,
          name: name || existingUser.name,
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      user = updatedUser;
    }

    // 3. ออก JWT Token
    const appToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'khorsuanboon_super_secret_key_2026',
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
      },
    });

  } catch (error: any) {
    // 🚨 แสดงรายละเอียด Error ที่แท้จริงใน Terminal ฝั่ง Backend
    console.error('❌ Google Auth Error Detail:', error?.response?.data || error?.message || error);
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed',
      error: error?.response?.data || error?.message 
    });
  }
});

router.post('/auth/logout', (req, res) => {
  return res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

export default router;