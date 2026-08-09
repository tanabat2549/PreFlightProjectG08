import { useEffect, useRef, useState } from 'react';
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
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // 1. ตรวจจับการ scroll (เลื่อนลง = ซ่อน, เลื่อนขึ้น = แสดง)
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setHidden(true); // เลื่อนลง -> ซ่อน
      } else {
        setHidden(false); // เลื่อนขึ้น -> แสดง
      }
      
      lastScrollY.current = currentScrollY;
    };

    // 2. ตรวจจับการแตะหน้าจอเพื่อ Toggle สลับ ซ่อน / แสดง
    const handleTouchOrClick = (e: MouseEvent | TouchEvent) => {
      // ถ้ากดที่ตัว Navbar เอง ไม่ต้องทำอะไร
      const target = e.target as HTMLElement;
      if (target.closest('.bottom-nav')) return;

      // แตะ 1 ครั้ง = สลับสถานะ (ถ้าแสดงอยู่จะซ่อน / ถ้าซ่อนอยู่จะกลับขึ้นมา)
      setHidden((prev) => !prev);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleTouchOrClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleTouchOrClick);
    };
  }, []);

  return (
    <nav className={`bottom-nav ${hidden ? 'nav-hidden' : ''}`}>
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