import type { Request, Response, NextFunction } from 'express';

export const ALL_ROLES = ['user', 'superadmin'];

export interface AdminRequest extends Request {
  userId?: number;
  actor?: {
    id: number;
    email: string;
    role: string;
  };
}

export function requireSuperAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  if (!req.actor) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' });
  }

  if (req.actor.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'ปฏิเสธการเข้าถึง: ต้องการสิทธิ์ SuperAdmin เท่านั้น' });
  }

  next();
}