import ResourcePage from './ResourcePage';
import type { Field } from './ResourcePage';
import { fmtDate } from '../ui';

const tick = (v: unknown) => (v ? '✓' : '–');

// field ตรงกับตาราง auspicious_days ใน schema.ts (date ต้องไม่ซ้ำกัน)
const fields: Field[] = [
  { key: 'date', label: 'วันที่', type: 'date', required: true, get: (r) => fmtDate(r.date) },
  { key: 'title', label: 'ชื่อวัน', required: true },
  { key: 'isBuddhaDay', label: 'วันพระ', type: 'checkbox', get: (r) => tick(r.isBuddhaDay) },
  { key: 'isAuspiciousDay', label: 'วันมงคล', type: 'checkbox', get: (r) => tick(r.isAuspiciousDay) },
  { key: 'recommendedActivities', label: 'กิจกรรมแนะนำ', type: 'textarea' },
];

export default function Calendars() {
  return (
    <ResourcePage
      title="ปฏิทินวันพระ"
      subtitle="จัดการวันพระและวันมงคล"
      path="/calendars"
      fields={fields}
      editMethod="put"
      rowLabel={(r) => r.title ?? `#${r.id}`}
    />
  );
}
