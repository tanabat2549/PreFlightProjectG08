import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId?: number;
      id?: number;
    };
    const userId = decoded.userId ?? decoded.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Token ไม่ถูกต้อง" });
    }
    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token หมดอายุหรือไม่ถูกต้อง" });
  }
}