import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const navItems = [
  { path: '/', label: 'หน้าแรก', icon: '🏠' },
  { path: '/temples', label: 'ค้นหาวัด', icon: '🔍' },
  { path: '/siemsee', label: 'เซียมซี', icon: '🥠', isFab: true },
  { path: '/calendar', label: 'ปฏิทิน', icon: '📅' },
  { path: '/profile', label: 'โปรไฟล์', icon: '👤' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        if (item.isFab) {
          // ปุ่มลอยตรงกลาง — เด่นกว่าแท็บอื่น เพราะเป็นฟีเจอร์หลักของแอป
          return (
            <Link key={item.path} to={item.path} className="nav-item nav-fab">
              <span className="nav-fab-circle">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}