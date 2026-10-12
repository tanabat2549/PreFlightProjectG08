import ResourcePage from './ResourcePage';
import type { Field } from './ResourcePage';

// field ตรงกับตาราง fortunes ใน schema.ts (ทุกช่องเป็น notNull)
const fields: Field[] = [
  { key: 'number', label: 'เลขใบ', type: 'number', required: true },
  { key: 'title', label: 'หัวข้อ', required: true },
  { key: 'workFortune', label: 'การงาน', type: 'textarea', required: true, list: false },
  { key: 'moneyFortune', label: 'การเงิน', type: 'textarea', required: true, list: false },
  { key: 'loveFortune', label: 'ความรัก', type: 'textarea', required: true, list: false },
  { key: 'studyFortune', label: 'การเรียน', type: 'textarea', required: true, list: false },
  { key: 'healthFortune', label: 'สุขภาพ', type: 'textarea', required: true, list: false },
];

export default function Fortunes() {
  return (
    <ResourcePage
      title="เซียมซี"
      subtitle="จัดการใบเซียมซีและคำทำนาย 5 ด้าน"
      path="/fortunes"
      fields={fields}
      editMethod="patch"
      rowLabel={(r) => (r.number != null ? `ใบที่ ${r.number}` : `#${r.id}`)}
      deleteWarning="ถ้ามีผู้ใช้เก็บใบนี้ไว้ในประวัติ ฐานข้อมูลอาจไม่ยอมให้ลบ (siemsee_histories อ้างอิงอยู่โดยไม่มี cascade)"
    />
  );
}
