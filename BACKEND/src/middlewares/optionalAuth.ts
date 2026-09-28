import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId?: number;
      id?: number;
    };
    req.userId = decoded.userId ?? decoded.id;
  } catch {
    // token ผิด/หมดอายุ — ไม่ error แค่ปล่อยผ่านแบบไม่ login
  }
  next();
}