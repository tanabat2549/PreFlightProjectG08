import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

import homeIcon from '../assets/icon/home.png';
import searchIcon from '../assets/icon/search.png';
import siemseeIcon from '../assets/icon/bttsiemsee.png';
import calendarIcon from '../assets/icon/calendar.png';
import profileIcon from '../assets/icon/profile.png';

const navItems = [
  { path: '/', label: 'หน้าแรก', img: homeIcon },
  { path: '/temples', label: 'ค้นหาวัด', img: searchIcon },
  { path: '/siemsee', label: 'เซียมซี', img: siemseeIcon, isFab: true },
  { path: '/calendar', label: 'ปฏิทิน', img: calendarIcon },
  { path: '/profile', label: 'โปรไฟล์', img: profileIcon },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        if (item.isFab) {
          return (
            <Link key={item.path} to={item.path} className="nav-item nav-fab">
              <span className="nav-fab-circle">
                <img src={item.img} alt={item.label} />
              </span>
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
            <span className="nav-icon">
              <img src={item.img} alt={item.label} />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}