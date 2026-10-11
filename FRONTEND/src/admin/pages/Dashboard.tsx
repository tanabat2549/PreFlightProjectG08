import { useEffect, useState } from 'react';
import { adminApi, errMsg } from '../adminApi';
import type { DayCount, Stats } from '../adminApi';
import { PageHead } from '../ui';

function Bars({ data, label }: { data: DayCount[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const W = 560, H = 120, bw = W / Math.max(1, data.length);
  return (
    <svg viewBox={`0 0 ${W} ${H + 40}`} className="ad-chart" role="img" aria-label={label}>
      <line x1="0" x2={W} y1={H + 20} y2={H + 20} stroke="var(--line)" />
      {data.map((d, i) => {
        const h = (d.count / max) * H;
        const x = i * bw + 5;
        return (
          <g key={d.day}>
            <title>{`${d.day}: ${d.count}`}</title>
            <rect x={x} y={H + 20 - h} width={bw - 10} height={Math.max(h, 1)} rx="2" fill="var(--gold)" />
            {d.count > 0 && (
              <text x={x + (bw - 10) / 2} y={H + 14 - h} textAnchor="middle" fontSize="11" fill="var(--ink)">{d.count}</text>
            )}
            <text x={x + (bw - 10) / 2} y={H + 35} textAnchor="middle" fontSize="10" fill="var(--muted)">{d.day.slice(8)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Stat({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="ad-stat">
      <span>{label}</span>
      <strong>{value.toLocaleString('th-TH')}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    adminApi.get('/stats').then((r) => setS(r.data.data)).catch((e) => setErr(errMsg(e)));
  }, []);

  if (err) return <p className="ad-error">{err}</p>;
  if (!s) return <p className="ad-muted">กำลังโหลด…</p>;

  return (
    <>
      <PageHead title="ภาพรวม" subtitle="สถิติการใช้งานล่าสุดของระบบ" />

      <div className="ad-stats">
        <Stat label="ผู้ใช้ทั้งหมด" value={s.users.total} note={`สมัครใหม่ 7 วันนี้ ${s.users.newLast7Days}`} />
        <Stat label="บัญชีที่ใช้งานอยู่" value={s.users.active} note={`ถูกล็อก ${s.users.locked}`} />
        <Stat label="วัด" value={s.totals.temples} />
        <Stat label="รีวิว" value={s.totals.reviews} />
        <Stat label="ใบเซียมซี" value={s.totals.fortunes} note={`เก็บแล้ว ${s.totals.siemseeDraws} ครั้ง`} />
        <Stat label="วันพระ/วันมงคล" value={s.totals.auspiciousDays} />
      </div>

      <div className="ad-grid2">
        <section className="ad-panel">
          <h2>เก็บใบเซียมซีต่อวัน (14 วัน)</h2>
          <Bars data={s.siemseeDrawsPerDay} label="จำนวนการเก็บเซียมซีต่อวัน" />
        </section>
        <section className="ad-panel">
          <h2>ผู้ใช้สมัครใหม่ต่อวัน (14 วัน)</h2>
          <Bars data={s.signupsPerDay} label="จำนวนผู้ใช้สมัครใหม่ต่อวัน" />
        </section>
      </div>

      <div className="ad-grid2">
        <section className="ad-panel">
          <h2>ผู้ใช้แยกตามสิทธิ์</h2>
          <table className="ad-table">
            <tbody>
              {s.usersByRole.map((r) => (
                <tr key={r.role}><td>{r.role}</td><td className="num">{r.count.toLocaleString('th-TH')}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="ad-panel">
          <h2>วัดที่มีรีวิวมากที่สุด</h2>
          <table className="ad-table">
            <thead><tr><th>วัด</th><th className="num">คะแนน</th><th className="num">รีวิว</th></tr></thead>
            <tbody>
              {s.topTemples.length === 0 && <tr><td colSpan={3} className="ad-muted">ยังไม่มีข้อมูล</td></tr>}
              {s.topTemples.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td className="num">{t.ratingAvg == null ? '–' : Number(t.ratingAvg).toFixed(1)}</td>
                  <td className="num">{t.ratingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
