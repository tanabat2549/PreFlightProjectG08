import { Router } from 'express';
import type { Response } from 'express';
import { dbClient as db } from '../../db/client.js';
import { auditLogs, users } from '../../db/schema.js';
import { and, desc, eq, ilike, sql, type SQL } from 'drizzle-orm';
import type { AdminRequest } from '../../middlewares/roles.js';

// Router นี้ถูก mount ที่ /api/admin/audit-logs
const router = Router();

// GET /api/admin/audit-logs — ดูประวัติการใช้งาน
// Query: ?page= &limit= &action= (prefix เช่น "user." หรือ "temple.create") &targetType= &actorId=
router.get('/', async (req: AdminRequest, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const action = typeof req.query.action === 'string' ? req.query.action.trim() : '';
    const targetType = typeof req.query.targetType === 'string' ? req.query.targetType.trim() : '';
    const actorId = Number(req.query.actorId);

    const conditions: SQL[] = [];
    if (action) conditions.push(ilike(auditLogs.action, `${action}%`));
    if (targetType) conditions.push(eq(auditLogs.targetType, targetType));
    if (Number.isInteger(actorId)) conditions.push(eq(auditLogs.actorId, actorId));

    const where = conditions.length ? and(...conditions) : undefined;

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(where);

    const rows = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        targetType: auditLogs.targetType,
        targetId: auditLogs.targetId,
        details: auditLogs.details,
        ip: auditLogs.ip,
        createdAt: auditLogs.createdAt,
        actorId: auditLogs.actorId,
        actorName: users.name,
        actorEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .where(where)
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
      .limit(limit)
      .offset((page - 1) * limit);

    return res.json({ success: true, page, limit, total, data: rows });
  } catch (error) {
    console.error('Audit logs error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
