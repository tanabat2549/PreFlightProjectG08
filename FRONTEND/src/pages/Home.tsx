import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './Home.css';

import iconTemple from '../assets/icon/iconTemple.png';

// SVG Icons แบบ Minimal
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
  overviewDescription?: string;
}

interface TempleItem {
  id: string;
  name: string;
  address: string;
  rating: number;
  distanceKm: number | null;
  imageUrl?: string | null;
}

interface BuddhaDayData {
  id: number;
  date: string;
  title: string;
  recommendedActivities?: Array<{ id: string; title: string; icon?: string }>;
}

const ALL_DAYS_DATA: Record<string, AuspiciousInfo> = {
  sunday: {
    dayName: 'วันอาทิตย์',
    luckyColors: [
      { name: 'เขียว', hex: '#2E7D32', role: 'เหนี่ยวทรัพย์ โชคลาภ' },
      { name: 'ชมพู', hex: '#E91E63', role: 'เมตตามหานิยม มีเสน่ห์' },
    ],
    unluckyColor: { name: 'น้ำเงิน', hex: '#1565C0' },
    luckyNumbers: ['1', '8', '4'],
    compatibleDay: { day: 'คนเกิดวันพฤหัสบดี', perk: 'เกื้อหนุนด้านสติปัญญา และการงานก้าวหน้า' },
    tip: 'ถวายหลอดไฟ หรือเติมน้ำมันตะเกียง เสริมแสงสว่างส่องทางชีวิต',
    overviewDescription: 'จิตที่ฝึกดีแล้ว นำสุขมาให้',
  },
  monday: {
    dayName: 'วันจันทร์',
    luckyColors: [
      { name: 'ม่วง', hex: '#7B1FA2', role: 'รับทรัพย์ เงินทองไหลมา' },
      { name: 'เขียว', hex: '#388E3C', role: 'การงานราบรื่น ผู้ใหญ่รัก' },
    ],
    unluckyColor: { name: 'แดง', hex: '#D32F2F' },
    luckyNumbers: ['2', '4', '6'],
    compatibleDay: { day: 'คนเกิดวันพุธ', perk: 'เจรจาธุรกิจราบรื่น ค้าขายได้กำไรดี' },
    tip: 'ทำบุญบริจาคน้ำดื่ม หรือถวายน้ำปานะ เสริมความร่มเย็นเป็นสุข',
    overviewDescription: 'ความสงบแห่งจิต นำมาซึ่งปัญญาและความสุข',
  },
  tuesday: {
    dayName: 'วันอังคาร',
    luckyColors: [
      { name: 'ส้ม', hex: '#F57C00', role: 'โชคลาภ เงินทองไม่ขาดสาย' },
      { name: 'ดำ/เทา', hex: '#424242', role: 'อำนาจบารมี ชนะอุปสรรค' },
    ],
    unluckyColor: { name: 'ขาว/ครีม', hex: '#EEEEEE' },
    luckyNumbers: ['3', '5', '8'],
    compatibleDay: { day: 'คนเกิดวันศุกร์', perk: 'ช่วยเหลือเกื้อกูลด้านการเงิน มีที่ปรึกษาดี' },
    tip: 'บริจาคเลือด หรือทำบุญอุปกรณ์การแพทย์ เสริมแคล้วคลาดปลอดภัย',
    overviewDescription: 'ความเพียรเป็นเลิศ ย่อมเอาชนะทุกอุปสรรค',
  },
  wednesday: {
    dayName: 'วันพุธ',
    luckyColors: [
      { name: 'ดำ/เทา', hex: '#424242', role: 'เรียกทรัพย์ โชคลาภก้อนโต' },
      { name: 'ฟ้า/น้ำเงิน', hex: '#1976D2', role: 'การงานเจริญรุ่งเรือง' },
    ],
    unluckyColor: { name: 'ชมพู', hex: '#E91E63' },
    luckyNumbers: ['2', '8', '5'],
    compatibleDay: { day: 'คนเกิดวันจันทร์', perk: 'ร่วมคิดร่วมทำโปรเจกต์ประสบความสำเร็จสูง' },
    tip: 'ทำบุญปล่อยปลา หรือบริจาคทานผู้ยากไร้ เสริมความคล่องตัวในชีวิต',
    overviewDescription: 'วาจาสุภาษิต เป็นมงคลสูงสุดแก่ชีวิต',
  },
  thursday: {
    dayName: 'วันพฤหัสบดี',
    luckyColors: [
      { name: 'เขียวหยก', hex: '#1B5E20', role: 'เหนี่ยวทรัพย์ โชคลาภ' },
      { name: 'ส้มอิฐ', hex: '#E65100', role: 'งานรุ่ง ผู้ใหญ่หนุน' },
    ],
    unluckyColor: { name: 'ดำสนิท', hex: '#212121' },
    luckyNumbers: ['5', '9', '1'],
    compatibleDay: { day: 'คนเกิดวันศุกร์', perk: 'เจรจาราบรื่น ค้าขายคล่อง ได้รับเมตตาอุปถัมภ์เป็นพิเศษ' },
    tip: 'เติมน้ำมันตะเกียง หรือโอนทำบุญค่าน้ำ-ไฟวัดลงท้ายด้วยเลข 9 เพื่อเปิดทางสว่างให้ชีวิต',
    overviewDescription: 'ปัญญาประดุจแสงสว่าง นำทางข้ามพ้นปัญหา',
  },
  friday: {
    dayName: 'วันศุกร์',
    luckyColors: [
      { name: 'ชมพู', hex: '#E91E63', role: 'เงินทองไหลมาเทมา มีโชค' },
      { name: 'ขาว/ครีม', hex: '#E0E0E0', role: 'ผู้ใหญ่อุปถัมภ์ค้ำชู' },
    ],
    unluckyColor: { name: 'ม่วง', hex: '#7B1FA2' },
    luckyNumbers: ['6', '3', '7'],
    compatibleDay: { day: 'คนเกิดวันอังคาร', perk: 'กระตุ้นพลังบวกและความกระตือรือร้น' },
    tip: 'ถวายดอกไม้สดหอมบูชาพระ เสริมเสน่ห์และสิริมงคล',
    overviewDescription: 'ความเมตตาปรารถนาดี นำพามิตรภาพและความร่มเย็น',
  },
  saturday: {
    dayName: 'วันเสาร์',
    luckyColors: [
      { name: 'ฟ้า/น้ำเงิน', hex: '#1565C0', role: 'เหนี่ยวทรัพย์ รับโชคใหญ่' },
      { name: 'แดง', hex: '#C62828', role: 'การงานก้าวหน้า มั่นคง' },
    ],
    unluckyColor: { name: 'เขียว', hex: '#2E7D32' },
    luckyNumbers: ['7', '8', '2'],
    compatibleDay: { day: 'คนเกิดวันพุธกลางคืน', perk: 'เสริมความมั่นคงและแก้ไขวิกฤตได้ดี' },
    tip: 'ทำบุญโลงศพ หรือไถ่ชีวิตโคกระบือ ปัดเป่าอุปสรรคให้ราบรื่น',
    overviewDescription: 'สติมั่นคง ไม่หวั่นไหวต่อโลกธรรม',
  },
};

const mapThaiDayToKey = (thaiDay?: string): string => {
  if (!thaiDay) return '';
  if (thaiDay.includes('อาทิตย์')) return 'sunday';
  if (thaiDay.includes('จันทร์')) return 'monday';
  if (thaiDay.includes('อังคาร')) return 'tuesday';
  if (thaiDay.includes('พุธ')) return 'wednesday';
  if (thaiDay.includes('พฤหัส')) return 'thursday';
  if (thaiDay.includes('ศุกร์')) return 'friday';
  if (thaiDay.includes('เสาร์')) return 'saturday';
  return '';
};

const getTodayKey = (): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

const COLOR_HEX_MAP: Record<string, string> = {
  'เขียวหยก': '#1B5E20',
  'ส้มอิฐ': '#E65100',
  'ดำสนิท': '#212121',
  'ขาว': '#EEEEEE',
  'ครีม': '#FFF9C4',
  'แดงเลือดหมู': '#880E4F',
  'ม่วง': '#7B1FA2',
  'ดำ': '#212121',
  'ฟ้า': '#42A5F5',
  'น้ำเงิน': '#1565C0',
  'เหลือง': '#FBC02D',
  'ชมพู': '#E91E63',
  'แดง': '#D32F2F',
  'เทา': '#9E9E9E',
  'ส้ม': '#FF9800',
  'ทอง': '#FFD700',
  'เขียวอ่อน': '#81C784',
  'น้ำตาล': '#795548',
  'บรอนซ์': '#CD7F32',
  'เขียว': '#2E7D32',
};

const getColorHex = (name: string): string => {
  const clean = name.trim();
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (clean.includes(key)) return hex;
  }
  return '#C99726';
};

interface DailyHoroscopeItem {
  id?: number;
  description: string;
  luckyColor: string;
  luckyNumber: string;
  friends: string;
  tips: string;
}

const getUserBirthDayDisplay = (u: any): string => {
  const raw = u?.birthDayOfWeek || u?.weekdaydate;
  if (raw) {
    return raw.startsWith('วัน') ? raw : `วัน${raw}`;
  }
  if (u?.birthday) {
    const d = new Date(u.birthday);
    if (!isNaN(d.getTime())) {
      const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
      return days[d.getDay()];
    }
  }
  const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  return days[new Date().getDay()];
};

const parseHoroscope = (item: DailyHoroscopeItem, dayName: string): AuspiciousInfo => {
  let luckyStr = item.luckyColor || '';
  let unluckyName = 'ดำ';
  const avoidMatch = luckyStr.match(/\(เลี่ยง\s*([^)]+)\)/);
  if (avoidMatch) {
    unluckyName = avoidMatch[1].trim();
    luckyStr = luckyStr.replace(avoidMatch[0], '').trim();
  }

  const luckyColorParts = luckyStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const luckyColors: LuckyColor[] = luckyColorParts.map((name, idx) => ({
    name,
    hex: getColorHex(name),
    role: idx === 0 ? 'เหนี่ยวทรัพย์ โชคลาภ' : 'งานรุ่ง ผู้ใหญ่หนุน',
  }));

  const luckyNumbers = (item.luckyNumber || '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

  return {
    dayName,
    luckyColors: luckyColors.length > 0 ? luckyColors : [
      { name: 'ทอง', hex: '#FFD700', role: 'เหนี่ยวทรัพย์ โชคลาภ' },
    ],
    unluckyColor: {
      name: unluckyName,
      hex: getColorHex(unluckyName),
    },
    luckyNumbers: luckyNumbers.length > 0 ? luckyNumbers : ['5', '9', '1'],
    compatibleDay: {
      day: item.friends || 'กัลยาณมิตร',
      perk: 'ช่วยส่งเสริมให้การงานและชีวิตราบรื่น สมหวังดังปรารถนา',
    },
    tip: item.tips || 'ทำบุญสร้างกุศลเพื่อเปิดทางสว่างให้ชีวิต',
    overviewDescription: item.description,
  };
};

const formatThaiShortDate = (dateString?: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ];
  const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  return `วัน${thaiDays[dateObj.getDay()]}ที่ ${day} ${thaiMonths[month - 1]}`;
};

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

export default function Home() {
  // 1. ผู้ใช้งานที่ล็อกอิน
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('userData');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. แต้มบารมี & การถวายประทีปประจำวัน
  const [meritCount, setMeritCount] = useState<number>(() => {
    const saved = localStorage.getItem('user_merit_score');
    return saved ? Number(saved) : 1280;
  });

  const [hasOffered, setHasOffered] = useState<boolean>(() => {
    const todayStr = getTodayDateString();
    return localStorage.getItem('last_offered_date') === todayStr;
  });

  const [offerText, setOfferText] = useState<string>(() => {
    const todayStr = getTodayDateString();
    return localStorage.getItem('last_offered_date') === todayStr
      ? 'อนุโมทนา สาธุ (+50 บารมี)'
      : 'ถวายประทีปบูชาประจำวัน';
  });

  // 3. วันพระถัดไป (ดึงจาก API /calendar/next)
  const [nextBuddhaDay, setNextBuddhaDay] = useState<BuddhaDayData | null>(null);
  const [buddhaDaysLeft, setBuddhaDaysLeft] = useState<number>(2);

  // 4. วัดใกล้เคียง (ดึงจาก Cache หรือ API /temples)
  const [nearestTemple, setNearestTemple] = useState<TempleItem | null>(null);

  // 5. ดวงประจำวันแบบสุ่ม (ดึงจาก seed ตาราง dailyHoroscopes และล็อกรายวันด้วย localStorage)
  const userBirthDayName = getUserBirthDayDisplay(user);
  const userDayKey = mapThaiDayToKey(user?.birthDayOfWeek) || getTodayKey();
  const fallbackAuspicious = ALL_DAYS_DATA[userDayKey] || ALL_DAYS_DATA.thursday;

  const [randomHoroscope, setRandomHoroscope] = useState<AuspiciousInfo | null>(() => {
    try {
      const todayStr = getTodayDateString();
      const savedDate = localStorage.getItem('daily_horoscope_date');
      const savedData = localStorage.getItem('daily_horoscope_data');
      if (savedDate === todayStr && savedData) {
        const item: DailyHoroscopeItem = JSON.parse(savedData);
        if (item && item.luckyColor) {
          return parseHoroscope(item, getUserBirthDayDisplay(user));
        }
      }
    } catch (e) {
      console.error('Failed to parse initial daily horoscope', e);
    }
    return null;
  });
  const [horoscopeLoading, setHoroscopeLoading] = useState<boolean>(false);

  const auspicious = randomHoroscope || fallbackAuspicious;

  // ฟังก์ชันโหลด/สุ่มดวงประจำวัน (เช็คตามวันที่ใน localStorage ก่อนสุ่มใหม่)
  const fetchOrLoadDailyHoroscope = async (forceRandom: boolean = false) => {
    const todayStr = getTodayDateString();
    const savedDate = localStorage.getItem('daily_horoscope_date');
    const savedData = localStorage.getItem('daily_horoscope_data');

    // ถ้าไม่ได้กดปุ่มสุ่มใหม่ และมีข้อมูลของวันนี้เก็บไว้แล้ว ให้ใช้ข้อมูลเดิมทันที
    if (!forceRandom && savedDate === todayStr && savedData) {
      try {
        const item: DailyHoroscopeItem = JSON.parse(savedData);
        if (item && item.luckyColor) {
          const parsed = parseHoroscope(item, userBirthDayName);
          setRandomHoroscope(parsed);
          return;
        }
      } catch (err) {
        console.error('Failed to parse cached daily horoscope', err);
      }
    }

    // ถ้าเป็นวันใหม่หรือกดสุ่มดวงใหม่ ให้ดึงจาก Backend
    setHoroscopeLoading(true);
    try {
      const res = await api.get('/horoscope/daily');
      if (res.data) {
        const item: DailyHoroscopeItem = res.data.data || res.data;
        if (item && item.luckyColor) {
          localStorage.setItem('daily_horoscope_date', todayStr);
          localStorage.setItem('daily_horoscope_data', JSON.stringify(item));

          const parsed = parseHoroscope(item, userBirthDayName);
          setRandomHoroscope(parsed);
        }
      }
    } catch (err) {
      console.error('Fetch daily horoscope error:', err);
    } finally {
      setHoroscopeLoading(false);
    }
  };

  // โหลดดวงประจำวันตามวันที่ใน localStorage หรือเมื่อวันเกิดเปลี่ยน
  useEffect(() => {
    fetchOrLoadDailyHoroscope(false);
  }, [userBirthDayName]);

  // โหลดวันพระถัดไปจาก Backend
  useEffect(() => {
    const fetchNextBuddhaDay = async () => {
      try {
        const res = await api.get('/calendar/next');
        if (res.data?.success && res.data.data) {
          const item: BuddhaDayData = res.data.data;
          setNextBuddhaDay(item);

          // คำนวณวันนับถอยหลัง
          const [y, m, d] = item.date.split('-').map(Number);
          const target = new Date(y, m - 1, d);
          target.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          setBuddhaDaysLeft(Math.max(0, diffDays));
        }
      } catch (err) {
        console.error('Fetch next buddha day error:', err);
      }
    };

    fetchNextBuddhaDay();
  }, []);

  // โหลดวัดใกล้เคียง
  useEffect(() => {
    const loadNearestTemple = async () => {
      try {
        // ตรวจสอบแคชใน sessionStorage ก่อน
        const cached = sessionStorage.getItem('cached_temples');
        if (cached) {
          const parsed: TempleItem[] = JSON.parse(cached);
          if (parsed.length > 0) {
            setNearestTemple(parsed[0]);
            return;
          }
        }

        // ถ้าไม่มีในแคช ดึงจาก API /temples
        const res = await api.get('/temples', {
          params: { radius: '10000' },
        });
        if (res.data?.success && res.data.data?.length > 0) {
          setNearestTemple(res.data.data[0]);
        }
      } catch (err) {
        console.error('Fetch nearest temple error:', err);
      }
    };

    loadNearestTemple();
  }, []);

  // อัปเดตข้อมูล user ล่าสุดหากมีการล็อกอิน
  useEffect(() => {
    try {
      const saved = localStorage.getItem('userData');
      if (saved) setUser(JSON.parse(saved));
    } catch {}
  }, []);

  const handleDailyMerit = () => {
    if (!hasOffered) {
      const todayStr = getTodayDateString();
      setHasOffered(true);
      const newScore = meritCount + 50;
      setMeritCount(newScore);
      setOfferText('อนุโมทนา สาธุ (+50 บารมี)');
      localStorage.setItem('user_merit_score', String(newScore));
      localStorage.setItem('last_offered_date', todayStr);
    }
  };

  return (
    <div className="home-container">
      {/* 1. Header Bar: Profile & Merit Score */}
      <header className="home-header">
        <div className="header-greeting">
          <div className="avatar-circle">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                referrerPolicy="no-referrer"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <Icons.Sparkles size={22} color="var(--sms-gold)" />
            )}
          </div>
          <div className="header-text">
            <h2>{user?.name ? `สวัสดีคุณ ${user.name}` : 'สวัสดีตอนเช้า'}</h2>
            <p className="sub-greeting">ขอให้วันนี้เป็นวันที่ราบรื่นและเปี่ยมด้วยกุศลจิต</p>
          </div>
        </div>
        <div className="merit-badge">
          <Icons.Sparkles size={16} color="var(--sms-gold)" />
          <div className="merit-info">
            <span className="merit-label">แต้มบารมี</span>
            <span className="merit-value">{meritCount.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* 🌟 Dashboard Layout แบบ 2 คอลัมน์บน Desktop */}
      <div className="home-dashboard-layout">

        {/* คอลัมน์หลักฝั่งซ้าย: Hero Banner + Master Card มงคลประจำวัน */}
        <div className="dashboard-main-col">
          {/* 2. Interactive Digital Sanctuary Hero */}
          <section className="sanctuary-hero">
            <div className="hero-glow-bg" />
            <div className="hero-content">
              <span className="daily-quote-tag">คติธรรมนำชีวิตประจำวัน</span>
              <h3 className="hero-quote">"{auspicious.overviewDescription || 'จิตที่ฝึกดีแล้ว นำสุขมาให้'}"</h3>
              <p className="hero-sub">สะสมกุศลจิตในทุกเช้าเพื่อความสงบและสติในการดำเนินชีวิต</p>
              <button
                type="button"
                className={`btn-altar-action ${hasOffered ? 'offered' : ''}`}
                onClick={handleDailyMerit}
              >
                {hasOffered ? <Icons.CheckCircle size={16} /> : <Icons.Flame size={16} />}
                <span>{offerText}</span>
              </button>
            </div>
          </section>

          {/* 3. Daily Auspicious Guide (กล่องใหญ่ครอบข้อมูลดวงวันเกิดทั้งหมด) */}
          <section className="auspicious-master-card">
            {/* ส่วนหัวในกล่องใหญ่ */}
            <div className="master-card-header">
              <div className="title-with-icon">
                <div className="title-text-group">
                  <span className="auspicious-sup-tag">คำทำนายและฤกษ์มงคล</span>
                  <h3 className="auspicious-heading">
                    มงคลประจำวัน <span className="highlight-day-chip">{userBirthDayName}</span>
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-change-birthday"
                  onClick={() => fetchOrLoadDailyHoroscope(true)}
                  title="สุ่มดวงใหม่จากระบบ"
                  disabled={horoscopeLoading}
                  style={{ cursor: 'pointer', border: 'none', background: 'var(--sms-gold-light)' }}
                >
                  <span className="btn-icon-bubble">
                    <Icons.Sparkles size={14} color="var(--sms-gold)" />
                  </span>
                  <span>{horoscopeLoading ? 'กำลังสุ่ม...' : 'สุ่มดวงใหม่'}</span>
                </button>

                <Link to="/profile" className="btn-change-birthday" title="เปลี่ยนวันเกิด">
                  <span className="btn-icon-bubble">
                    <Icons.Settings size={14} />
                  </span>
                  <span>เปลี่ยนวันเกิด</span>
                </Link>
              </div>
            </div>

            {/* กล่อง Bento ภายในกล่องใหญ่ */}
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
        </div>

        {/* คอลัมน์ขวา: ฟีเจอร์เสริม (เซียมซี, ปฏิทินวันพระ, วัดใกล้คุณ) */}
        <aside className="dashboard-side-col">
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
                <span className="countdown-number">
                  {buddhaDaysLeft === 0 ? 'วันนี้' : buddhaDaysLeft}
                </span>
                <span className="countdown-unit">
                  {buddhaDaysLeft === 0 ? 'วันพระ' : 'วัน'}
                </span>
              </div>
              <div className="upcoming-info">
                <h4>วันพระที่จะถึง ({nextBuddhaDay?.title || 'วันพระมงคล'})</h4>
                <p>
                  {nextBuddhaDay?.date ? formatThaiShortDate(nextBuddhaDay.date) : 'เร็วๆ นี้'}
                  {' • '}
                  {nextBuddhaDay?.recommendedActivities && nextBuddhaDay.recommendedActivities.length > 0
                    ? `แนะนำ ${nextBuddhaDay.recommendedActivities.map((a) => a.title).slice(0, 2).join(', ')}`
                    : 'แนะนำรักษาศีล สวดมนต์ หรือทำบุญตักบาตร'}
                </p>
              </div>
            </div>
          </section>

          {/* วัดใกล้ฉัน Section */}
          <section className="temples-showcase-section">
            <div className="section-title-wrap">
              <div className="title-with-icon">
                <img src={iconTemple} alt="วัด" className="templeThumb" />
                <h3>วัดใกล้คุณในเชียงใหม่</h3>
              </div>
              <Link to="/temples" className="link-more">
                ดูทั้งหมด &gt;
              </Link>
            </div>

            <div className="temple-card-modern">
              <div className="temple-cover-avatar">
                <img
                  src={nearestTemple?.imageUrl || iconTemple}
                  alt={nearestTemple?.name || 'วัด'}
                  className="templeThumb"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = iconTemple;
                  }}
                />
              </div>
              <div className="temple-details">
                <div className="temple-title-row">
                  <h4>{nearestTemple?.name || 'วัดพระธาตุดอยสุเทพฯ'}</h4>
                  <span className="badge-highlight">
                    {nearestTemple ? 'วัดใกล้คุณ' : 'วัดคู่บ้านคู่เมือง'}
                  </span>
                </div>
                <p className="temple-location">
                  {nearestTemple?.address || 'ต.สุเทพ อ.เมือง เชียงใหม่'}
                </p>
                <div className="temple-meta-tags">
                  <span className="meta-tag">
                    <Icons.MapPin size={11} />
                    {nearestTemple?.distanceKm != null ? `${nearestTemple.distanceKm} กม.` : 'ใกล้คุณ'}
                  </span>
                  <span className="meta-tag rating">
                    <Icons.Star size={11} />
                    {nearestTemple?.rating ? nearestTemple.rating.toFixed(1) : '4.8'}
                  </span>
                </div>
              </div>
              <Link to="/temples" className="btn-direct-nav" title="ดูเส้นทาง">
                <Icons.ArrowUpRight size={16} />
              </Link>
            </div>
          </section>
        </aside>

      </div>
    </div>
  );
}