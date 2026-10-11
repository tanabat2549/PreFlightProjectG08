import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminContext } from './AdminContext';
import AdminLayout from './AdminLayout';
import { adminApi, errMsg, getToken } from './adminApi';
import type { Actor } from './adminApi';
import './admin.css';

type State = { s: 'loading' } | { s: 'ok'; me: Actor } | { s: 'denied'; msg: string };

// ตรวจสิทธิ์ด้วย GET /api/admin/me — ถ้าไม่ใช่ superadmin backend จะตอบ 401/403 เอง
export default function AdminGuard() {
  const [state, setState] = useState<State>(getToken() ? { s: 'loading' } : { s: 'denied', msg: 'ยังไม่ได้เข้าสู่ระบบ' });

  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    adminApi
      .get('/me')
      .then((r) => alive && setState({ s: 'ok', me: r.data.data }))
      .catch((e) => alive && setState({ s: 'denied', msg: errMsg(e) }));
    return () => { alive = false; };
  }, []);

  if (state.s === 'loading') return <div className="ad-center">กำลังตรวจสอบสิทธิ์…</div>;
  if (state.s === 'denied') {
    return (
      <div className="ad-center">
        <div className="ad-denied">
          <h1>เข้าหน้านี้ไม่ได้</h1>
          <p>{state.msg}</p>
          <Link className="ad-btn primary" to="/">กลับหน้าแรก</Link>
        </div>
      </div>
    );
  }
  return (
    <AdminContext.Provider value={state.me}>
      <AdminLayout />
    </AdminContext.Provider>
  );
}
