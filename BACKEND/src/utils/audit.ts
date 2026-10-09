import { dbClient as db } from '../db/client.js';
import { auditLogs } from '../db/schema.js';

export async function logAudit(
  req: any,
  action: string,
  targetType?: string,
  targetId?: number,
  details?: Record<string, any>
) {
  try {
    const actorId = req.actor?.id || null;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
//
    await db.insert(auditLogs).values({
      actorId,
      action,
      targetType,
      targetId,
      details,
      ip: typeof ip === 'string' ? ip : String(ip),
    });
  } catch (error) {
    console.error('❌ Failed to create audit log:', error);
  }
}