import ResourcePage from './ResourcePage';
import type { Field } from './ResourcePage';
import { fmtDate } from '../ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pick = (r: any, ...paths: string[]) => {
  for (const p of paths) {
    const v = p.split('.').reduce((o, k) => o?.[k], r);
    if (v != null) return v;
  }
  return null;
};

// schema: reviews(userId, templeId, rating, comment, createdAt)
// ถ้า GET /api/admin/reviews join ชื่อมาให้ จะแสดงชื่อ ไม่งั้นแสดง id
const fields: Field[] = [
  { key: 'temple', label: 'วัด', get: (r) => pick(r, 'templeName', 'temple.name', 'templeId') },
  { key: 'user', label: 'ผู้รีวิว', get: (r) => pick(r, 'userName', 'userEmail', 'user.name', 'user.email', 'userId') },
  { key: 'rating', label: 'คะแนน', get: (r) => (r.rating != null ? `${r.rating} / 5` : null) },
  { key: 'comment', label: 'ความเห็น' },
  { key: 'createdAt', label: 'เมื่อ', get: (r) => fmtDate(r.createdAt) },
];

export default function Reviews() {
  return (
    <ResourcePage
      title="รีวิว"
      subtitle="ดูและลบรีวิวที่ไม่เหมาะสม"
      path="/reviews"
      fields={fields}
      canCreate={false}
      editMethod={false}
      rowLabel={(r) => `รีวิว #${r.id}`}
      deleteWarning="ระบบจะคำนวณคะแนนเฉลี่ยของวัดใหม่ให้อัตโนมัติ"
    />
  );
}
