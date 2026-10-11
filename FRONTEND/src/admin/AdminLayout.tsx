import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAdmin } from './AdminContext';

const NAV = [
  { to: '/admin', label: 'ภาพรวม', end: true },
  { to: '/admin/users', label: 'ผู้ใช้' },
  { to: '/admin/temples', label: 'วัด' },
  { to: '/admin/fortunes', label: 'เซียมซี' },
  { to: '/admin/reviews', label: 'รีวิว' },
  { to: '/admin/calendars', label: 'ปฏิทินวันพระ' },
  { to: '/admin/audit-logs', label: 'ประวัติการใช้งาน' },
];

export default function AdminLayout() {
  const me = useAdmin();
  return (
    <div className="ad-shell">
      <aside className="ad-side">
        <div className="ad-brand">
          <strong>ขอส่วนบุญ</strong>
          <span>ระบบจัดการหลังบ้าน</span>
        </div>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="ad-me">
          <div className="ad-me-name">{me.name ?? me.email}</div>
          <div className="ad-me-role">{me.role}</div>
          <Link to="/">กลับไปหน้าแอป</Link>
        </div>
      </aside>
      <main className="ad-main">
        <Outlet />
      </main>
    </div>
  );
}
