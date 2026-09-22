import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

import iconTemple from '../assets/icon/iconTemple.png';

// SVG Icons แบบ Minimal (ใช้ SVG ตรง ไม่พึ่งพา external library ลดปัญหา hook conflict)
const Icons = {
  Sparkles: ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </svg>
  ),
  Flame: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3Z" />
    </svg>
  ),
  CheckCircle: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Palette: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  Hash: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  ),
  Users: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Lightbulb: ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  ),
  ScrollText: ({ size = 20, color = 'currentColor', strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M15 8h-5" />
      <path d="M15 12h-5" />
    </svg>
  ),
  Calendar: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  Landmark: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" x2="22" y1="22" y2="22" />
      <line x1="12" x2="12" y1="2" y2="6" />
      <path d="m2 6 10-4 10 4" />
      <line x1="6" x2="6" y1="10" y2="18" />
      <line x1="10" x2="10" y1="10" y2="18" />
      <line x1="14" x2="14" y1="10" y2="18" />
      <line x1="18" x2="18" y1="10" y2="18" />
    </svg>
  ),
  MapPin: ({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Star: ({ size = 12, fill = '#B7791F' }: { size?: number; fill?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Settings: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  ArrowRight: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" x2="19" y1="12" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  ArrowUpRight: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" x2="17" y1="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  ),
};

interface LuckyColor {
  name: string;
  hex: string;
  role: string;
}

interface AuspiciousInfo {
  dayName: string;
  luckyColors: LuckyColor[];
  unluckyColor: { name: string; hex: string };
  luckyNumbers: string[];
  compatibleDay: { day: string; perk: string };
  tip: string;
}

const dailyAuspiciousData: Record<string, AuspiciousInfo> = {
  thursday: {
    dayName: 'วันพฤหัสบดี',
    luckyColors: [
      { name: 'เขียวหยก', hex: '#1B5E20', role: 'เหนี่ยวทรัพย์ โชคลาภ' },
      { name: 'ส้มอิฐ', hex: '#E65100', role: 'งานรุ่ง ผู้ใหญ่หนุน' },
    ],
    unluckyColor: { name: 'ดำสนิท', hex: '#212121' },
    luckyNumbers: ['5', '9', '1'],
    compatibleDay: {
      day: 'คนเกิดวันศุกร์',
      perk: 'เจรจาราบรื่น ค้าขายคล่อง ได้รับเมตตาอุปถัมภ์เป็นพิเศษ',
    },
    tip: 'เติมน้ำมันตะเกียง หรือโอนทำบุญค่าน้ำ-ไฟวัดลงท้ายด้วยเลข 9 เพื่อเปิดทางสว่างให้ชีวิต',
  },
};

export default function Home() {
  const [userBirthDay] = useState<string>('thursday');
  const [meritCount, setMeritCount] = useState<number>(1280);
  const [hasOffered, setHasOffered] = useState<boolean>(false);
  const [offerText, setOfferText] = useState<string>('ถวายประทีปบูชาประจำวัน');

  const auspicious = dailyAuspiciousData[userBirthDay] || dailyAuspiciousData['thursday'];

  const handleDailyMerit = () => {
    if (!hasOffered) {
      setHasOffered(true);
      setMeritCount((prev) => prev + 50);
      setOfferText('อนุโมทนา สาธุ (+50 บารมี)');
    }
  };

  return (
    <div className="home-container">
      {/* 1. Header Bar: Profile & Merit Score */}
      <header className="home-header">
        <div className="header-greeting">
          <div className="avatar-circle">
            <Icons.Sparkles size={22} color="var(--sms-gold)" />
          </div>
          <div className="header-text">
            <h2>สวัสดีตอนเช้า</h2>
            <p className="sub-greeting">ขอให้วันนี้เป็นวันที่ราบรื่นและเปี่ยมด้วยกุศลจิต</p>
          </div>
        </div>
      </header>

      {/* Hero Daily Siemsee Card */}
      <section className="siemsee-banner">
        <div className="banner-badge">แนะนำประจำวัน</div>
        <div className="banner-content">
          <h3>เซียมซีประจำวัน</h3>
          <p>เสี่ยงทายโชคชะตาประจำวันนี้เพื่อรับคำแนะนำและข้อคิดในการดำเนินชีวิต</p>
          <Link to="/siemsee" className="btn-siemsee">
            เสี่ยงทายเลย
          </Link>
        </div>

        <div className="lucky-bento-grid">
          {/* Card: สีมงคล */}
          <div className="bento-card bento-colors">
            <div className="card-top-label">
              <Icons.Palette size={13} />
              <span>สีมงคลเปิดดวง</span>
            </div>
            <div className="color-list">
              {auspicious.luckyColors.map((color, idx) => (
                <div key={idx} className="color-pill">
                  <span className="color-indicator" style={{ backgroundColor: color.hex }} />
                  <div className="color-desc">
                    <strong>{color.name}</strong>
                    <small>{color.role}</small>
                  </div>
                </div>
              ))}
              <div className="color-pill unlucky-pill">
                <span className="color-indicator" style={{ backgroundColor: auspicious.unluckyColor.hex }} />
                <div className="color-desc">
                  <strong>เลี่ยง {auspicious.unluckyColor.name}</strong>
                  <small>กาลกิณีประจำวัน</small>
                </div>
              </div>
            </div>
          </div>

          {/* Card: เลขมงคล */}
          <div className="bento-card bento-numbers">
            <div className="card-top-label">
              <Icons.Hash size={13} />
              <span>เลขเด่นนำโชค</span>
            </div>
            <div className="lucky-number-row">
              {auspicious.luckyNumbers.map((num, idx) => (
                <div key={idx} className="lucky-gold-coin">
                  <span>{num}</span>
                </div>
              ))}
            </div>
            <p className="number-note">เหมาะสำหรับเจรจาหรือเลือกเวลามงคล</p>
          </div>

          {/* Card: คนวันเกิดถูกชะตา */}
          <div className="bento-card bento-friend">
            <div className="card-top-label">
              <Icons.Users size={13} />
              <span>กัลยาณมิตรเกื้อหนุน</span>
            </div>
            <div className="friend-content">
              <div className="friend-badge">{auspicious.compatibleDay.day}</div>
              <p className="friend-perk">{auspicious.compatibleDay.perk}</p>
            </div>
          </div>

          {/* Card: เคล็ดลับเสริมดวงประจำวัน */}
          <div className="bento-card bento-tip">
            <div className="tip-left">
              <div className="tip-icon-wrap">
                <Icons.Lightbulb size={18} color="var(--sms-gold)" />
              </div>
              <div>
                <div className="card-top-label">
                  <span>เคล็ดลับเสริมดวงวันนี้</span>
                </div>
                <p className="tip-text">{auspicious.tip}</p>
              </div>
            </div>
            <Link to="/temples" className="btn-find-temple">
              <span>ค้นหาวัดเสริมดวง</span>
              <Icons.ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Dual Feature Cards: เซียมซี & ปฏิทินวันพระ */}
      <div className="dual-feature-grid">
        {/* เซียมซีการ์ด */}
        <section className="interactive-siemsee-card">
          <div className="siemsee-decor">
            <Icons.ScrollText size={72} strokeWidth={1} color="var(--sms-gold)" />
          </div>
          <div className="siemsee-body">
            <div className="tag-popular">เสี่ยงทายประจำวัน</div>
            <h3>เซียมซีส่องทางชีวิต</h3>
            <p>ตั้งจิตอธิษฐานถามถึงการงาน การเงิน หรือความรัก เพื่อรับคำกลอนเตือนสติ</p>
            <Link to="/siemsee" className="btn-primary-glow">
              <Icons.ScrollText size={16} />
              <span>เขย่าเซียมซีวันนี้</span>
            </Link>
          </div>
        </section>

        {/* ปฏิทินวันพระ Widget */}
        <section className="buddhist-calendar-card">
          <div className="calendar-header">
            <span className="cal-tag">
              <Icons.Calendar size={14} />
              <span>ปฏิทินธรรมะ</span>
            </span>
            <Link to="/calendar" className="cal-link">
              ดูทั้งหมด &gt;
            </Link>
          </div>
          <div className="calendar-content">
            <div className="countdown-box">
              <span className="countdown-number">2</span>
              <span className="countdown-unit">วัน</span>
            </div>
            <div className="upcoming-info">
              <h4>วันพระที่จะถึง (แรม ๑๕ ค่ำ)</h4>
              <p>วันศุกร์นี้ • แนะนำรักษาศีล สวดมนต์ หรือถวายสังฆทาน</p>
            </div>
          </div>
        </section>
      </div>

      {/* 5. วัดใกล้ฉัน Section */}
      <section className="temples-showcase-section">
        <div className="section-title-wrap">
          <div className="title-with-icon">
            <img src={iconTemple} alt="วัด" className="templeThumb"/> 
            <h3>วัดใกล้คุณในเชียงใหม่</h3>
          </div>
          <Link to="/temples" className="link-more">
            ดูทั้งหมด &gt;
          </Link>
        </div>

        <div className="temple-card-modern">
          <div className="temple-cover-avatar">
           <img src={iconTemple} alt="วัด" className="templeThumb"/>
          </div>
          <div className="temple-details">
            <div className="temple-title-row">
              <h4>วัดพระธาตุดอยสุเทพราชวรวิหาร</h4>
              <span className="badge-highlight">วัดคู่บ้านคู่เมือง</span>
            </div>
            <p className="temple-location">ต.สุเทพ อ.เมือง จ.เชียงใหม่</p>
            <div className="temple-meta-tags">
              <span className="meta-tag">
                <Icons.MapPin size={11} />
                2.4 กม.
              </span>
              <span className="meta-tag rating">
                <Icons.Star size={11} />
                4.9 (1,420 รีวิว)
              </span>
              <span className="meta-tag highlight">
                <Icons.Sparkles size={11} color="var(--sms-maroon)" />
                ขอพรบารมี
              </span>
            </div>
          </div>
          <Link to="/temples" className="btn-direct-nav" title="ดูเส้นทาง">
            <Icons.ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}