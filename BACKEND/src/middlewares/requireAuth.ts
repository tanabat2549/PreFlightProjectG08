import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { dbClient as db } from "../db/client.js";
import { users } from "../db/schema.js";

// ขยาย Type ของ Request ให้รองรับทั้ง userId และ actor
export interface AuthRequest extends Request {
  userId?: number;
  actor?: {
    id: number;
    email: string;
    role: string;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });
    }

    // 1. แกะรหัส JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId?: number;
      id?: number;
    };
    const userId = decoded.userId ?? decoded.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Token ไม่ถูกต้อง" });
    }

    // 2. ดึงข้อมูลผู้ใช้จากฐานข้อมูลจริง เพื่อความปลอดภัยและเช็ก Role ล่าสุด
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "ไม่พบผู้ใช้งานนี้ในระบบ" });
    }

    // 3. แนบข้อมูลทั้งหมดเข้ากับ Request object
    req.userId = user.id;
    req.actor = {
      id: user.id,
      email: user.email ?? '',
      role: user.role, // เช่น 'user' หรือ 'superadmin'
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token หมดอายุหรือไม่ถูกต้อง" });
  }
}