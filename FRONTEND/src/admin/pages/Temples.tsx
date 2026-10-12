import ResourcePage from './ResourcePage';
import type { Field } from './ResourcePage';

// field ตรงกับตาราง temples ใน schema.ts
const fields: Field[] = [
  { key: 'name', label: 'ชื่อวัด', required: true },
  { key: 'address', label: 'ที่อยู่', type: 'textarea' },
  { key: 'description', label: 'รายละเอียด', type: 'textarea', list: false },
  { key: 'latitude', label: 'ละติจูด', type: 'number', required: true, list: false },
  { key: 'longitude', label: 'ลองจิจูด', type: 'number', required: true, list: false },
  { key: 'openTime', label: 'เวลาเปิด', type: 'time', get: (r) => r.openTime?.slice(0, 5) },
  { key: 'closeTime', label: 'เวลาปิด', type: 'time', get: (r) => r.closeTime?.slice(0, 5) },
  { key: 'imageUrl', label: 'รูปภาพ (URL)', list: false },
  { key: 'ratingAvg', label: 'คะแนนเฉลี่ย', form: false, get: (r) => (r.ratingAvg == null ? '–' : Number(r.ratingAvg).toFixed(1)) },
  { key: 'ratingCount', label: 'จำนวนรีวิว', form: false },
];

export default function Temples() {
  return (
    <ResourcePage
      title="วัด"
      subtitle="เพิ่ม แก้ไข หรือลบข้อมูลวัด"
      path="/temples"
      fields={fields}
      editMethod="patch"
      rowLabel={(r) => r.name ?? `#${r.id}`}
      deleteWarning="รีวิวทั้งหมดของวัดนี้จะถูกลบไปด้วย"
    />
  );
}
