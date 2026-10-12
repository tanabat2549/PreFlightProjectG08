import { useEffect, useState } from 'react';
import { adminApi, errMsg } from '../adminApi';
import type { AuditLog } from '../adminApi';
import { PageHead, Pager, fmtDate } from '../ui';

const LIMIT = 30;

const FILTERS = [
  { v: '', l: 'ทุกกิจกรรม' },
  { v: 'user.', l: 'ผู้ใช้' },
  { v: 'temple.', l: 'วัด' },
  { v: 'fortune.', l: 'เซียมซี' },
  { v: 'review.', l: 'รีวิว' },
  { v: 'calendar.', l: 'ปฏิทิน' },
];

const LABELS: Record<string, string> = {
  'user.role.change': 'เปลี่ยนสิทธิ์ผู้ใช้',
  'user.lock': 'ล็อกบัญชี',
  'user.unlock': 'ปลดล็อกบัญชี',
  'user.delete': 'ลบผู้ใช้',
  'calendar.create': 'เพิ่มวันพระ/วันมงคล',
  'calendar.update': 'แก้ไขวันพระ/วันมงคล',
  'calendar.delete': 'ลบวันพระ/วันมงคล',
};

function tone(action: string) {
  if (/delete|lock$/.test(action) && !action.endsWith('unlock')) return 'bad';
  if (/create|unlock/.test(action)) return 'ok';
  return 'gold';
}

export default function AuditLogs() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    setLoading(true);
    adminApi
      .get('/audit-logs', { params: { page, limit: LIMIT, action: action || undefined } })
      .then((r) => { setRows(r.data.data); setTotal(r.data.total); setErr(''); })
      .catch((e) => setErr(errMsg(e)))
      .finally(() => setLoading(false));
  }, [page, action]);

  return (
    <>
      <PageHead title="ประวัติการใช้งาน" subtitle="บันทึกการกระทำของผู้ดูแลระบบ เรียงจากล่าสุด" />

      <div className="ad-toolbar">
        <select className="ad-input" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
          {FILTERS.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
        </select>
      </div>

      {err && <p className="ad-error">{err}</p>}

      <div className="ad-tablewrap">
        <table className="ad-table">
          <thead><tr><th>เวลา</th><th>ผู้ดำเนินการ</th><th>กิจกรรม</th><th>เป้าหมาย</th><th>รายละเอียด</th><th>IP</th></tr></thead>
          <tbody>
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="ad-muted">ยังไม่มีบันทึก</td></tr>}
            {rows.map((l) => {
              const d = l.details ? JSON.stringify(l.details) : '';
              return (
                <tr key={l.id}>
                  <td className="nowrap">{fmtDate(l.createdAt, true)}</td>
                  <td>{l.actorName ?? l.actorEmail ?? (l.actorId ? `#${l.actorId}` : '–')}</td>
                  <td><span className={`ad-badge ${tone(l.action)}`} title={l.action}>{LABELS[l.action] ?? l.action}</span></td>
                  <td className="nowrap">{l.targetType ? `${l.targetType}${l.targetId != null ? ` #${l.targetId}` : ''}` : '–'}</td>
                  <td><code className="ad-clip" title={d}>{d || '–'}</code></td>
                  <td className="nowrap">{l.ip ?? '–'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pager page={page} limit={LIMIT} total={total} onPage={setPage} />
    </>
  );
}
