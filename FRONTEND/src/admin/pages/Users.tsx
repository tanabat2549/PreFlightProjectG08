import { useEffect, useState } from 'react';
import { adminApi, errMsg, ROLES } from '../adminApi';
import type { AdminUser } from '../adminApi';
import { useAdmin } from '../AdminContext';
import { ConfirmModal, PageHead, Pager, fmtDate } from '../ui';

const LIMIT = 20;

type Pending =
  | { type: 'role'; user: AdminUser; role: string }
  | { type: 'lock'; user: AdminUser }
  | { type: 'delete'; user: AdminUser };

export default function Users() {
  const me = useAdmin();
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [actErr, setActErr] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setQ(qInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    setLoading(true);
    adminApi
      .get('/users', { params: { page, limit: LIMIT, q: q || undefined, role: role || undefined } })
      .then((r) => { setRows(r.data.data); setTotal(r.data.total); setErr(''); })
      .catch((e) => setErr(errMsg(e)))
      .finally(() => setLoading(false));
  }, [page, q, role, tick]);

  async function confirm() {
    if (!pending) return;
    setBusy(true); setActErr('');
    try {
      const id = pending.user.id;
      if (pending.type === 'role') await adminApi.patch(`/users/${id}/role`, { role: pending.role });
      if (pending.type === 'lock') await adminApi.patch(`/users/${id}/active`, { isActive: !pending.user.isActive });
      if (pending.type === 'delete') await adminApi.delete(`/users/${id}`);
      setPending(null);
      setTick((t) => t + 1);
    } catch (e) {
      setActErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  const name = (u: AdminUser) => u.name || u.email;

  return (
    <>
      <PageHead title="ผู้ใช้" subtitle="เปลี่ยนสิทธิ์ ล็อกบัญชี หรือลบผู้ใช้" />

      <div className="ad-toolbar">
        <input className="ad-input" placeholder="ค้นหาชื่อหรืออีเมล" value={qInput} onChange={(e) => setQInput(e.target.value)} />
        <select className="ad-input" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">ทุกสิทธิ์</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {err && <p className="ad-error">{err}</p>}

      <div className="ad-tablewrap">
        <table className="ad-table">
          <thead>
            <tr><th>ผู้ใช้</th><th>สิทธิ์</th><th>สถานะ</th><th>สมัครเมื่อ</th><th></th></tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && <tr><td colSpan={5} className="ad-muted">ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข</td></tr>}
            {rows.map((u) => {
              const self = u.id === me.id;
              return (
                <tr key={u.id} className={u.isActive ? '' : 'locked'}>
                  <td>
                    <div className="ad-user">
                      {u.picture ? <img src={u.picture} alt="" referrerPolicy="no-referrer" /> : <span className="ad-avatar">{name(u).charAt(0)}</span>}
                      <div>
                        <div>{name(u)}{self && <em> (คุณ)</em>}</div>
                        <small className="ad-muted">{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      className="ad-input sm"
                      value={u.role}
                      disabled={self}
                      aria-label={`สิทธิ์ของ ${name(u)}`}
                      onChange={(e) => { setActErr(''); setPending({ type: 'role', user: u, role: e.target.value }); }}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td><span className={`ad-badge ${u.isActive ? 'ok' : 'bad'}`}>{u.isActive ? 'ใช้งานได้' : 'ถูกล็อก'}</span></td>
                  <td>{fmtDate(u.createdAt)}</td>
                  <td className="actions">
                    <button className="ad-btn sm" disabled={self} onClick={() => { setActErr(''); setPending({ type: 'lock', user: u }); }}>
                      {u.isActive ? 'ล็อก' : 'ปลดล็อก'}
                    </button>
                    <button className="ad-btn sm danger-o" disabled={self} onClick={() => { setActErr(''); setPending({ type: 'delete', user: u }); }}>ลบ</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pager page={page} limit={LIMIT} total={total} onPage={setPage} />

      {pending?.type === 'role' && (
        <ConfirmModal title="เปลี่ยนสิทธิ์ผู้ใช้" confirmLabel="เปลี่ยนสิทธิ์" busy={busy} error={actErr} onConfirm={confirm} onClose={() => setPending(null)}>
          <p>เปลี่ยนสิทธิ์ของ <b>{name(pending.user)}</b> จาก <b>{pending.user.role}</b> เป็น <b>{pending.role}</b></p>
        </ConfirmModal>
      )}
      {pending?.type === 'lock' && (
        <ConfirmModal
          title={pending.user.isActive ? 'ล็อกบัญชี' : 'ปลดล็อกบัญชี'}
          confirmLabel={pending.user.isActive ? 'ล็อกบัญชี' : 'ปลดล็อก'}
          danger={pending.user.isActive}
          busy={busy} error={actErr} onConfirm={confirm} onClose={() => setPending(null)}
        >
          <p>
            {pending.user.isActive
              ? <>ผู้ใช้ <b>{name(pending.user)}</b> จะเข้าสู่ระบบและใช้งานต่อไม่ได้ทันที แม้ล็อกอินค้างอยู่</>
              : <>ผู้ใช้ <b>{name(pending.user)}</b> จะกลับมาใช้งานได้ตามปกติ</>}
          </p>
        </ConfirmModal>
      )}
      {pending?.type === 'delete' && (
        <ConfirmModal title="ลบผู้ใช้" confirmLabel="ลบถาวร" danger busy={busy} error={actErr} onConfirm={confirm} onClose={() => setPending(null)}>
          <p>ลบ <b>{name(pending.user)}</b> ถาวร รีวิวและประวัติเซียมซีของผู้ใช้นี้จะถูกลบไปด้วย และกู้คืนไม่ได้</p>
          <p className="ad-muted">ถ้าแค่ต้องการระงับการใช้งาน ให้ใช้ “ล็อก” แทน</p>
        </ConfirmModal>
      )}
    </>
  );
}
