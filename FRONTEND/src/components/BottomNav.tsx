import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css'; // อย่าลืมสร้างไฟล์ CSS นี้

import homeIcon from '../assets/icon/home.png';
import searchIcon from '../assets/icon/search.png';
import siemseeIcon from '../assets/icon/bttsiemsee.png';
import calendarIcon from '../assets/icon/calendar.png';
import profileIcon from '../assets/icon/profile.png';

const navItems = [
  { path: '/', label: 'หน้าแรก', img: homeIcon },
  { path: '/temples', label: 'ค้นหาวัด', img: searchIcon },
  // เอา property isFab: true ออก เพราะเราต้องการให้มันเหมือนเพื่อน
  { path: '/siemsee', label: 'เซียมซี', img: siemseeIcon }, 
  { path: '/calendar', label: 'ปฏิทิน', img: calendarIcon },
  { path: '/profile', label: 'โปรไฟล์', img: profileIcon },
];

export default function BottomNav() {
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

 
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`bottom-nav ${hidden ? 'nav-hidden' : ''}`}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        // ใช้โครงสร้างเดียวสำหรับทุกปุ่ม
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <img src={item.img} alt={item.label} />
            </span>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}