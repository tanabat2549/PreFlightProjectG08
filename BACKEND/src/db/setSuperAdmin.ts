import { fileURLToPath } from 'url';
import { eq } from 'drizzle-orm';
import { dbClient as db } from './client.js';
import { users } from './schema.js';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('วิธีใช้: npx tsx src/db/setSuperAdmin.ts อีเมลของคุณ@gmail.com');
    process.exit(1);
  }

  try {
    const [u] = await db
      .update(users)
      .set({ role: 'superadmin' })
      .where(eq(users.email, email))
      .returning();

    if (u) {
      console.log(`✅ ตั้ง ${u.email} เป็น super_admin สำเร็จแล้ว`);
    } else {
      console.log('❌ ไม่พบอีเมลนี้ในระบบ (ต้องเคยล็อกอินด้วยอีเมลนี้มาก่อน)');
    }
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการอัปเดตสิทธิ์:', error);
  }
}

// เช็กให้รันเฉพาะเมื่อเรียกผ่าน CLI โดยตรง
const isDirectCall = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectCall) {
  main().then(() => process.exit(0));
}