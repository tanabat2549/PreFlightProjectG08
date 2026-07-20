import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

// ==========================================
// 1. MOCK DATA (ข้อมูลจำลอง)
// ==========================================
const mockFortunes = [
  {
    num: 1,
    title: 'มหาโชค มหาลาภ',
    work: 'การงานรุ่งเรือง ได้รับโอกาสใหม่ มีผู้ใหญ่คอยสนับสนุน',
    love: 'คนโสดมีเกณฑ์พบมิตรแท้ คนมีคู่ความสัมพันธ์อบอุ่น',
    money: 'การเงินหมุนเวียนดี มีโชคลาภจากการเดินทาง',
    study: 'ผลการเรียนเป็นที่น่าพอใจ สอบแข่งขันมีข่าวดี',
    health: 'ร่างกายสมบูรณ์แข็งแรง สุขภาพกายใจแจ่มใส',
  },
  {
    num: 9,
    title: 'ก้าวหน้า มั่นคง',
    work: 'งานราบรื่น ปัญหาอุปสรรคที่มีจะคลี่คลายในเร็ววัน',
    love: 'เข้าใจกันมากขึ้น ระวังเรื่องอารมณ์เล็กน้อย',
    money: 'มีรายได้เสริมเข้ามา ควรรอบคอบเรื่องการใช้จ่าย',
    study: 'ความพยายามเริ่มส่งผลสำเร็จ อย่าเพิ่งท้อแท้',
    health: 'ระวังอาการปวดเมื่อยหลังและคอจากการทำงาน',
  },
  {
    num: 18,
    title: 'สติปัญญา นำพาโชค',
    work: 'งานท้าทาย ใช้สติในการตัดสินใจแล้วจะผ่านไปด้วยดี',
    love: 'เน้นการเติบโตร่วมกัน มีเกณฑ์ได้ร่วมทำบุญกับคนรัก',
    money: 'โชคลาภมาจากความสามารถและการทำงานหนัก',
    study: 'ตื่นตัวในการเรียนรู้ จะทำคะแนนได้ดีเยี่ยม',
    health: 'ควรพักผ่อนให้เพียงพอและดื่มน้ำมากๆ',
  },
];

// ==========================================
// 2. COMPONENTS หน้าต่าง ๆ
// ==========================================

// 🏠 หน้าแรก (HomePage)
function HomePage() {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--primary-red)' }}>สวัสดีตอนเช้า ☀️</h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '14px', margin: '4px 0 0' }}>ขอให้วันนี้เป็นวันที่ดีและมีบุญ</p>
        </div>
        <div className="temple-stamp" style={{ width: '48px', height: '48px', fontSize: '11px' }}>
          วัดไทย
        </div>
      </div>

      <div className="talisman-card" style={{ textAlign: 'center', backgroundColor: '#FFFDF5' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--primary-gold)', marginBottom: '8px' }}>🥠 เซียมซีประจำวัน</h3>
        <p style={{ fontSize: '14px', margin: '0 0 16px', color: 'var(--text-main)' }}>
          เสี่ยงทายโชคชะตาประจำวันนี้เพื่อรับคำแนะนำ
        </p>
        <Link to="/siemsee">
          <button className="btn-gold" style={{ width: '100%' }}>เสี่ยงทายเลย</button>
        </Link>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--primary-red)' }}>🛕 วัดใกล้คุณ</h3>
          <Link to="/temples" style={{ fontSize: '12px', color: 'var(--primary-gold)', textDecoration: 'none', fontWeight: 'bold' }}>ดูทั้งหมด</Link>
        </div>

        <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '60px', height: '60px', background: '#EAE5D9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            🏛️
          </div>
          <div>
            <h4 style={{ fontSize: '14px', color: 'var(--text-main)', margin: 0 }}>วัดพระธาตุดอยสุเทพ</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-sub)', margin: '4px 0 0' }}>📍 2.4 กม. • ⭐ 4.8 (128 รีวิว)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔍 หน้าค้นหาวัด (TemplePage)
function TemplePage() {
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: 'var(--primary-red)', marginBottom: '16px' }}>🔍 ค้นหาวัดใกล้คุณ</h2>
      <input
        type="text"
        placeholder="ค้นหาวัด, จังหวัด, ชื่อวัตถุมงคล..."
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '20px',
          border: '1px solid #E0DCD3',
          marginBottom: '16px',
          fontSize: '14px',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button style={{ padding: '6px 16px', borderRadius: '15px', border: 'none', background: 'var(--primary-gold)', color: '#FFF', fontSize: '13px', cursor: 'pointer' }}>ใกล้ฉัน</button>
        <button style={{ padding: '6px 16px', borderRadius: '15px', border: '1px solid #DDD', background: '#FFF', fontSize: '13px', cursor: 'pointer' }}>ยอดนิยม</button>
        <button style={{ padding: '6px 16px', borderRadius: '15px', border: '1px solid #DDD', background: '#FFF', fontSize: '13px', cursor: 'pointer' }}>เปิดตอนนี้</button>
      </div>

      <div className="talisman-card" style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '40px 20px' }}>
        <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>🗺️</span>
        <p style={{ margin: 0, fontSize: '14px' }}>ระบบแผนที่เตรียมเชื่อมต่อกับ Google Maps API</p>
      </div>
    </div>
  );
}

// 🥠 หน้าเขย่าเซียมซี (SiemseePage)
function SiemseePage() {
  const [isShaking, setIsShaking] = useState(false);
  const [result, setResult] = useState<typeof mockFortunes[0] | null>(null);

  const handleShake = () => {
    setIsShaking(true);
    setResult(null);

    setTimeout(() => {
      const random = mockFortunes[Math.floor(Math.random() * mockFortunes.length)];
      setResult(random);
      setIsShaking(false);
    }, 1500);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--primary-red)' }}>🥠 เขย่าเซียมซี</h2>
      <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '20px' }}>
        ตั้งจิตอธิษฐานแล้วกดปุ่มเพื่อเขย่ากระบอกเซียมซี
      </p>

      <div style={{
        fontSize: '80px',
        margin: '20px 0',
        display: 'inline-block',
        transform: isShaking ? 'rotate(15deg) scale(1.1)' : 'none',
        transition: 'transform 0.1s infinite alternate',
      }}>
        🪵
      </div>

      <div>
        <button
          className="btn-gold"
          onClick={handleShake}
          disabled={isShaking}
          style={{ width: '80%', fontSize: '16px', cursor: isShaking ? 'not-allowed' : 'pointer' }}
        >
          {isShaking ? 'กำลังเขย่า...' : 'กดเพื่อเขย่าเซียมซี'}
        </button>
      </div>

      {result && (
        <div className="talisman-card" style={{ marginTop: '24px', textAlign: 'left' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px dashed var(--primary-gold)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--primary-red)', margin: 0 }}>
              ✨ ใบที่ {result.num}: {result.title}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-main)' }}>
            <p style={{ margin: 0 }}>💼 <strong>การงาน:</strong> {result.work}</p>
            <p style={{ margin: 0 }}>❤️ <strong>ความรัก:</strong> {result.love}</p>
            <p style={{ margin: 0 }}>💰 <strong>การเงิน:</strong> {result.money}</p>
            <p style={{ margin: 0 }}>🎓 <strong>การเรียน:</strong> {result.study}</p>
            <p style={{ margin: 0 }}>🏥 <strong>สุขภาพ:</strong> {result.health}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// 📅 หน้าปฏิทินวันพระ (CalendarPage)
function CalendarPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: 'var(--primary-red)', marginBottom: '16px' }}>📅 ปฏิทินวันพระ / วันมงคล</h2>
      <div className="talisman-card">
        <h3 style={{ fontSize: '16px', margin: '0 0 8px', color: 'var(--primary-gold)' }}>🌕 วันพระถัดไป</h3>
        <p style={{ margin: '0 0 8px', color: 'var(--primary-red)', fontWeight: 'bold', fontSize: '18px' }}>วันขึ้น ๑๕ ค่ำ เดือน ๘</p>
        <p style={{ fontSize: '13px', color: 'var(--text-sub)', margin: 0 }}>
          💡 <strong>กิจกรรมแนะนำ:</strong> ทำบุญ ตักบาตร ถือศีลฟังธรรม ถวายสังฆทาน
        </p>
      </div>
    </div>
  );
}

// 👤 หน้าโปรไฟล์ (ProfilePage)
function ProfilePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#EAE5D9', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
        👤
      </div>
      <h2 style={{ color: 'var(--primary-red)', margin: '0 0 4px' }}>ผู้ใช้งานทั่วไป</h2>
      <p style={{ color: 'var(--text-sub)', fontSize: '13px', margin: '0 0 24px' }}>ผู้ทำบุญระดับ 1</p>

      <div style={{ display: 'flex', justifyContent: 'space-around', background: '#FFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div>
          <strong style={{ fontSize: '20px', color: 'var(--primary-gold)' }}>12</strong>
          <p style={{ fontSize: '12px', color: 'var(--text-sub)', margin: '4px 0 0' }}>เขย่าเซียมซี</p>
        </div>
        <div style={{ borderLeft: '1px solid #EFECE6' }}></div>
        <div>
          <strong style={{ fontSize: '20px', color: 'var(--primary-gold)' }}>3</strong>
          <p style={{ fontSize: '12px', color: 'var(--text-sub)', margin: '4px 0 0' }}>รีวิววัด</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. BOTTOM NAVIGATION & MAIN APP
// ==========================================
function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'หน้าแรก', icon: '🏠' },
    { path: '/temples', label: 'ค้นหาวัด', icon: '🔍' },
    { path: '/siemsee', label: 'เซียมซี', icon: '🥠' },
    { path: '/calendar', label: 'ปฏิทิน', icon: '📅' },
    { path: '/profile', label: 'โปรไฟล์', icon: '👤' },
  ];

  return (
    <nav style={{
      position: 'sticky',
      bottom: 0,
      background: '#FFFFFF',
      borderTop: '1px solid #EFECE6',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 0 14px',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
      zIndex: 100
    }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            fontSize: '11px',
            fontWeight: isActive ? 'bold' : 'normal',
            color: isActive ? 'var(--primary-gold)' : 'var(--text-sub)',
            gap: '4px'
          }}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/temples" element={<TemplePage />} />
            <Route path="/siemsee" element={<SiemseePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}