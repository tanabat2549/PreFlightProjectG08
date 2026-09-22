import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { dbClient as db } from './client.js';
import { fortunes, auspiciousDays } from './schema.js';

// ข้อมูลปฏิทินวันพระและวันมงคลตลอดปี 2569 (2026) ครบทั้ง 12 เดือน
const auspiciousDaysData = [
  // --- มกราคม 2569 ---
  {
    date: '2026-01-03',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๑๕ ค่ำ เดือน ๑',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'รักษาศีล ๕ / สมาธิ', category: 'precept', icon: '🧘' },
      { id: '3', title: 'สวดมนต์ ฟังธรรม', category: 'chant', icon: '📜' },
      { id: '4', title: 'ถวายสังฆทาน', category: 'offering', icon: '🪷' },
    ],
  },
  {
    date: '2026-01-11',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๘ ค่ำ เดือน ๒',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'สวดมนต์บูชาพระ', category: 'chant', icon: '📜' },
      { id: '3', title: 'ปล่อยปลาทำบุญ', category: 'offering', icon: '🐟' },
    ],
  },
  {
    date: '2026-01-18',
    isBuddhaDay: true,
    isAuspiciousDay: true,
    title: 'วันขึ้น ๑๕ ค่ำ เดือน ๒ (วันธงชัย)',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรพระสงฆ์', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถืออุโบสถศีล', category: 'precept', icon: '🧘' },
      { id: '3', title: 'ถวายภัตตาหารเพล', category: 'offering', icon: '🪷' },
    ],
  },
  {
    date: '2026-01-26',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๘ ค่ำ เดือน ๒',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'เจริญจิตตภาวนา', category: 'precept', icon: '🧘' },
      { id: '3', title: 'สวดพระปริตร', category: 'chant', icon: '📜' },
    ],
  },

  // --- กุมภาพันธ์ 2569 ---
  {
    date: '2026-02-02',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๑๕ ค่ำ เดือน ๒',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ฟังพระธรรมเทศนา', category: 'chant', icon: '📜' },
      { id: '3', title: 'ถวายน้ำดื่ม/ผ้าไตร', category: 'offering', icon: '🪷' },
    ],
  },
  {
    date: '2026-02-10',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๘ ค่ำ เดือน ๓',
    recommendedActivities: [
      { id: '1', title: 'ใส่บาตรอาหารสด', category: 'alms', icon: '🍚' },
      { id: '2', title: 'สวดมนต์เช้า-เย็น', category: 'chant', icon: '📜' },
      { id: '3', title: 'บำเพ็ญสาธารณประโยชน์', category: 'precept', icon: '✨' },
    ],
  },
  {
    date: '2026-02-17',
    isBuddhaDay: true,
    isAuspiciousDay: true,
    title: 'วันขึ้น ๑๕ ค่ำ เดือน ๓ (วันมาฆบูชา)',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตรใหญ่', category: 'alms', icon: '🍚' },
      { id: '2', title: 'รักษาอุโบสถศีล', category: 'precept', icon: '🧘' },
      { id: '3', title: 'ฟังเทศน์โอวาทปาติโมกข์', category: 'chant', icon: '📜' },
      { id: '4', title: 'เวียนเทียนรอบอุโบสถ', category: 'offering', icon: '🪷' },
    ],
  },
  {
    date: '2026-02-25',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๘ ค่ำ เดือน ๓',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'รักษาศีล ๕', category: 'precept', icon: '🧘' },
      { id: '3', title: 'สวดพระพุทธคุณ', category: 'chant', icon: '📜' },
    ],
  },

  // --- มีนาคม 2569 ---
  {
    date: '2026-03-04',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๑๕ ค่ำ เดือน ๓',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถวายสังฆทานอุทิศ', category: 'offering', icon: '🪷' },
      { id: '3', title: 'นั่งสมาธิแผ่เมตตา', category: 'precept', icon: '🧘' },
    ],
  },
  {
    date: '2026-03-12',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๘ ค่ำ เดือน ๔',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'สวดมนต์บทกรณียเมตตสูตร', category: 'chant', icon: '📜' },
      { id: '3', title: 'ปล่อยนกปล่อยปลา', category: 'offering', icon: '🐟' },
    ],
  },
  {
    date: '2026-03-19',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๑๕ ค่ำ เดือน ๔',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถือศีล ๘ ตลอดวัน', category: 'precept', icon: '🧘' },
      { id: '3', title: 'ฟังพระธรรมเทศนา', category: 'chant', icon: '📜' },
      { id: '4', title: 'ถวายภัตตาหารเพล', category: 'offering', icon: '🪷' },
    ],
  },
  {
    date: '2026-03-27',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๘ ค่ำ เดือน ๔',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรตอนเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ไหว้พระประจำวันเกิด', category: 'chant', icon: '🙏' },
      { id: '3', title: 'นั่งสมาธิภาวนา', category: 'precept', icon: '🧘' },
    ],
  },

  // --- เมษายน 2569 ---
  {
    date: '2026-04-02',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๑๔ ค่ำ เดือน ๔',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถวายน้ำดื่มแด่พระสงฆ์', category: 'offering', icon: '🪷' },
      { id: '3', title: 'สวดมนต์บูชาคุณพระรัตนตรัย', category: 'chant', icon: '📜' },
    ],
  },
  {
    date: '2026-04-10',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๘ ค่ำ เดือน ๕',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'สรงน้ำพระพุทธรูป', category: 'offering', icon: '✨' },
      { id: '3', title: 'เจริญสติตลอดวัน', category: 'precept', icon: '🧘' },
    ],
  },
  {
    date: '2026-04-17',
    isBuddhaDay: true,
    isAuspiciousDay: true,
    title: 'วันขึ้น ๑๕ ค่ำ เดือน ๕ (วันเถลิงศก/วันสงกรานต์)',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญปีใหม่ไทย ตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'บังสุกุลอุทิศบรรพบุรุษ', category: 'chant', icon: '📜' },
      { id: '3', title: 'ถวายผ้าไตรจีวร', category: 'offering', icon: '🪷' },
      { id: '4', title: 'รดน้ำขอพรบุพการี', category: 'precept', icon: '🙏' },
    ],
  },
  {
    date: '2026-04-25',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๘ ค่ำ เดือน ๕',
    recommendedActivities: [
      { id: '1', title: 'ใส่บาตรพระ', category: 'alms', icon: '🍚' },
      { id: '2', title: 'สวดมนต์พระชินบัญชร', category: 'chant', icon: '📜' },
      { id: '3', title: 'รักษาศีล ๕', category: 'precept', icon: '🧘' },
    ],
  },

  // --- พฤษภาคม 2569 ---
  {
    date: '2026-05-02',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๑๕ ค่ำ เดือน ๕',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถวายหลอดไฟ/ค่าน้ำค่าไฟ', category: 'offering', icon: '💡' },
      { id: '3', title: 'สวดมนต์แผ่เมตตา', category: 'chant', icon: '📜' },
    ],
  },
  {
    date: '2026-05-10',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๘ ค่ำ เดือน ๖',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรอาหารสด', category: 'alms', icon: '🍚' },
      { id: '2', title: 'งดเว้นเนื้อสัตว์/ทานมังสวิรัติ', category: 'precept', icon: '🥗' },
      { id: '3', title: 'ฟังธรรมเทศนา', category: 'chant', icon: '📜' },
    ],
  },
  {
    date: '2026-05-17',
    isBuddhaDay: true,
    isAuspiciousDay: true,
    title: 'วันขึ้น ๑๕ ค่ำ เดือน ๖ (วันวิสาขบูชา)',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตรใหญ่', category: 'alms', icon: '🍚' },
      { id: '2', title: 'รักษาศีล ๘ เจริญสมาธิ', category: 'precept', icon: '🧘' },
      { id: '3', title: 'ฟังเทศน์มหาชาติ', category: 'chant', icon: '📜' },
      { id: '4', title: 'เวียนเทียนรอบอุโบสถช่วงค่ำ', category: 'offering', icon: '🪷' },
    ],
  },
  {
    date: '2026-05-25',
    isBuddhaDay: true,
    isAuspiciousDay: true,
    title: 'วันแรม ๘ ค่ำ เดือน ๖ (วันอัฏฐมีบูชา)',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'รำลึกพระธรรมสังเวช', category: 'precept', icon: '🧘' },
      { id: '3', title: 'สวดพระพุทธคุณ ๑๐๘ จบ', category: 'chant', icon: '📜' },
    ],
  },
  {
    date: '2026-05-31',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๑๔ ค่ำ เดือน ๖',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถวายดอกไม้ธูปเทียน', category: 'offering', icon: '🪷' },
      { id: '3', title: 'เจริญจิตตภาวนา', category: 'precept', icon: '🧘' },
    ],
  },

  // --- มิถุนายน 2569 ---
  {
    date: '2026-06-08',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๘ ค่ำ เดือน ๗',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรอาหารสด', category: 'alms', icon: '🍚' },
      { id: '2', title: 'รักษาศีล ๕', category: 'precept', icon: '🧘' },
      { id: '3', title: 'สวดมนต์บทมงคลสูตร', category: 'chant', icon: '📜' },
    ],
  },
  {
    date: '2026-06-15',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๑๕ ค่ำ เดือน ๗',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถวายภัตตาหารเพล', category: 'offering', icon: '🪷' },
      { id: '3', title: 'ฟังเทศน์ฟังธรรม', category: 'chant', icon: '📜' },
      { id: '4', title: 'ถือศีล ๘', category: 'precept', icon: '🧘' },
    ],
  },
  {
    date: '2026-06-23',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๘ ค่ำ เดือน ๗',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ไหว้พระประธาน', category: 'chant', icon: '🙏' },
      { id: '3', title: 'ปล่อยปลาปล่อยเต่า', category: 'offering', icon: '🐟' },
    ],
  },
  {
    date: '2026-06-30',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๑๕ ค่ำ เดือน ๗',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญใส่บาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถวายสังฆทานยา', category: 'offering', icon: '💊' },
      { id: '3', title: 'นั่งสมาธิระลึกความตายอย่างมีสติ', category: 'precept', icon: '🧘' },
    ],
  },

  // --- กรกฎาคม 2569 ---
  {
    date: '2026-07-08',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๘ ค่ำ เดือน ๘',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรตอนเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'สวดมนต์บทธัมมจักกัปปวัตตนสูตร', category: 'chant', icon: '📜' },
      { id: '3', title: 'เจริญเมตตาภาวนา', category: 'precept', icon: '🧘' },
    ],
  },
  {
    date: '2026-07-29',
    isBuddhaDay: true,
    isAuspiciousDay: true,
    title: 'วันขึ้น ๑๕ ค่ำ เดือน ๘ (วันอาสาฬหบูชา)',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ฟังเทศน์ปฐมเทศนา', category: 'chant', icon: '📜' },
      { id: '3', title: 'ถวายเทียนพรรษา/หลอดไฟ', category: 'offering', icon: '🕯️' },
      { id: '4', title: 'เวียนเทียนรำลึกพระธรรม', category: 'offering', icon: '🪷' },
    ],
  },
  {
    date: '2026-07-30',
    isBuddhaDay: true,
    isAuspiciousDay: true,
    title: 'วันแรม ๑ ค่ำ เดือน ๘ (วันเข้าพรรษา)',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรดอกไม้/อาหารสด', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ตั้งสัจจะงดเว้นอบายมุขตลอดพรรษา', category: 'precept', icon: '🧘' },
      { id: '3', title: 'ถวายผ้าอาบน้ำฝน', category: 'offering', icon: '🪷' },
    ],
  },

  // --- สิงหาคม 2569 ---
  {
    date: '2026-08-07',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๘ ค่ำ เดือน ๘',
    recommendedActivities: [
      { id: '1', title: 'ใส่บาตรพระ', category: 'alms', icon: '🍚' },
      { id: '2', title: 'รักษาศีล ๕', category: 'precept', icon: '🧘' },
      { id: '3', title: 'สวดมนต์บทพาหุงมหากา', category: 'chant', icon: '📜' },
    ],
  },
  {
    date: '2026-08-14',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๑๕ ค่ำ เดือน ๘',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถวายสังฆทาน', category: 'offering', icon: '🪷' },
      { id: '3', title: 'นั่งสมาธิภาวนา', category: 'precept', icon: '🧘' },
    ],
  },
  {
    date: '2026-08-22',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๘ ค่ำ เดือน ๙',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'สวดมนต์บูชาพระแก้วมรกต', category: 'chant', icon: '🙏' },
      { id: '3', title: 'ปล่อยปลาทำบุญ', category: 'offering', icon: '🐟' },
    ],
  },
  {
    date: '2026-08-29',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๑๕ ค่ำ เดือน ๙',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถืออุโบสถศีล ๘', category: 'precept', icon: '🧘' },
      { id: '3', title: 'ฟังเทศน์ฟังธรรม', category: 'chant', icon: '📜' },
      { id: '4', title: 'ถวายภัตตาหารเพล', category: 'offering', icon: '🪷' },
    ],
  },

  // --- กันยายน 2569 ---
  {
    date: '2026-09-06',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๘ ค่ำ เดือน ๙',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรตอนเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'รักษาศีล ๕', category: 'precept', icon: '🧘' },
      { id: '3', title: 'สวดมนต์บทโพชฌังคปริตร', category: 'chant', icon: '📜' },
    ],
  },
  {
    date: '2026-09-12',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๑๔ ค่ำ เดือน ๙',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถวายสังฆทานอุทิศส่วนกุศล', category: 'offering', icon: '🪷' },
      { id: '3', title: 'นั่งสมาธิแผ่เมตตา', category: 'precept', icon: '🧘' },
    ],
  },
  {
    date: '2026-09-20',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๘ ค่ำ เดือน ๑๐',
    recommendedActivities: [
      { id: '1', title: 'ใส่บาตรอาหารสด', category: 'alms', icon: '🍚' },
      { id: '2', title: 'สวดมนต์ทำวัตร', category: 'chant', icon: '📜' },
      { id: '3', title: 'ปล่อยสัตว์น้ำทำบุญ', category: 'offering', icon: '🐟' },
    ],
  },
  {
    date: '2026-09-27',
    isBuddhaDay: true,
    isAuspiciousDay: true,
    title: 'วันขึ้น ๑๕ ค่ำ เดือน ๑๐ (วันสารทไทย)',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตรกระยาสารท', category: 'alms', icon: '🍚' },
      { id: '2', title: 'อุทิศบุญกุศลให้บรรพชน', category: 'chant', icon: '📜' },
      { id: '3', title: 'ถือศีล ๘ เจริญสมาธิ', category: 'precept', icon: '🧘' },
      { id: '4', title: 'ถวายสังฆทานใหญ่', category: 'offering', icon: '🪷' },
    ],
  },

  // --- ตุลาคม 2569 ---
  {
    date: '2026-10-05',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๘ ค่ำ เดือน ๑๐',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'สวดพระปริตร', category: 'chant', icon: '📜' },
      { id: '3', title: 'รักษาศีล ๕', category: 'precept', icon: '🧘' },
    ],
  },
  {
    date: '2026-10-12',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๑๕ ค่ำ เดือน ๑๐',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถวายผ้าไตรจีวร', category: 'offering', icon: '🪷' },
      { id: '3', title: 'นั่งสมาธิภาวนา', category: 'precept', icon: '🧘' },
    ],
  },
  {
    date: '2026-10-20',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๘ ค่ำ เดือน ๑๑',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ฟังพระธรรมเทศนา', category: 'chant', icon: '📜' },
      { id: '3', title: 'ร่วมบุญทอดกฐิน', category: 'offering', icon: '🪷' },
    ],
  },
  {
    date: '2026-10-25',
    isBuddhaDay: true,
    isAuspiciousDay: true,
    title: 'วันขึ้น ๑๕ ค่ำ เดือน ๑๑ (วันออกพรรษา)',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตรวันออกพรรษา', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ฟังเทศน์มหาชาติคาถาพัน', category: 'chant', icon: '📜' },
      { id: '3', title: 'รักษาอุโบสถศีล', category: 'precept', icon: '🧘' },
      { id: '4', title: 'ร่วมงานประเพณีทอดกฐิน', category: 'offering', icon: '🪷' },
    ],
  },
  {
    date: '2026-10-26',
    isBuddhaDay: false,
    isAuspiciousDay: true,
    title: 'วันแรม ๑ ค่ำ เดือน ๑๑ (วันตักบาตรเทโว)',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเทโวโรหณะ', category: 'alms', icon: '🍚' },
      { id: '2', title: 'เจริญพระพุทธมนต์', category: 'chant', icon: '📜' },
      { id: '3', title: 'ร่วมขบวนแห่พระพุทธรูป', category: 'offering', icon: '✨' },
    ],
  },

  // --- พฤศจิกายน 2569 ---
  {
    date: '2026-11-03',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๘ ค่ำ เดือน ๑๑',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรตอนเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'รักษาศีล ๕', category: 'precept', icon: '🧘' },
      { id: '3', title: 'ร่วมทอดกฐินสามัคคี', category: 'offering', icon: '🪷' },
    ],
  },
  {
    date: '2026-11-10',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๑๕ ค่ำ เดือน ๑๑',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถวายสังฆทานบริวารกฐิน', category: 'offering', icon: '🪷' },
      { id: '3', title: 'นั่งสมาธิภาวนา', category: 'precept', icon: '🧘' },
    ],
  },
  {
    date: '2026-11-18',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๘ ค่ำ เดือน ๑๒',
    recommendedActivities: [
      { id: '1', title: 'ใส่บาตรอาหารแห้ง', category: 'alms', icon: '🍚' },
      { id: '2', title: 'สวดมนต์บทมหาจักรพรรดิ', category: 'chant', icon: '📜' },
      { id: '3', title: 'ปล่อยปลาทำบุญ', category: 'offering', icon: '🐟' },
    ],
  },
  {
    date: '2026-11-24',
    isBuddhaDay: true,
    isAuspiciousDay: true,
    title: 'วันขึ้น ๑๕ ค่ำ เดือน ๑๒ (วันลอยกระทง)',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ขอขมาพระแม่คงคา', category: 'offering', icon: '🪷' },
      { id: '3', title: 'ฟังธรรมเทศนาอานิสงส์กฐิน', category: 'chant', icon: '📜' },
      { id: '4', title: 'ถือศีล ๘ สวดมนต์', category: 'precept', icon: '🧘' },
    ],
  },

  // --- ธันวาคม 2569 ---
  {
    date: '2026-12-02',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๘ ค่ำ เดือน ๑๒',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรเช้า', category: 'alms', icon: '🍚' },
      { id: '2', title: 'รักษาศีล ๕', category: 'precept', icon: '🧘' },
      { id: '3', title: 'นั่งสมาธิแผ่เมตตา', category: 'precept', icon: '🧘' },
    ],
  },
  {
    date: '2026-12-09',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันแรม ๑๕ ค่ำ เดือน ๑๒',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญใส่บาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถวายสังฆทานส่งท้ายเดือน', category: 'offering', icon: '🪷' },
      { id: '3', title: 'สวดมนต์ทำวัตรเช้า-เย็น', category: 'chant', icon: '📜' },
    ],
  },
  {
    date: '2026-12-17',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๘ ค่ำ เดือน ๑',
    recommendedActivities: [
      { id: '1', title: 'ตักบาตรพระสงฆ์', category: 'alms', icon: '🍚' },
      { id: '2', title: 'สวดพระพุทธคุณ', category: 'chant', icon: '📜' },
      { id: '3', title: 'บำเพ็ญประโยชน์ต่อส่วนรวม', category: 'precept', icon: '✨' },
    ],
  },
  {
    date: '2026-12-24',
    isBuddhaDay: true,
    isAuspiciousDay: false,
    title: 'วันขึ้น ๑๕ ค่ำ เดือน ๑',
    recommendedActivities: [
      { id: '1', title: 'ทำบุญตักบาตร', category: 'alms', icon: '🍚' },
      { id: '2', title: 'ถืออุโบสถศีล', category: 'precept', icon: '🧘' },
      { id: '3', title: 'ฟังพระธรรมเทศนา', category: 'chant', icon: '📜' },
      { id: '4', title: 'ถวายภัตตาหารเพล', category: 'offering', icon: '🪷' },
    ],
  },
];

async function seed() {
  console.log('🌱 กำลังเริ่มต้นกระบวนการ Seed ข้อมูล...');

  try {
    // ล้างข้อมูลเก่าและ Reset Primary Key ให้เริ่มที่ 1 ใหม่
    await db.execute(sql`TRUNCATE TABLE fortunes RESTART IDENTITY CASCADE`);
    await db.execute(sql`TRUNCATE TABLE auspicious_days RESTART IDENTITY CASCADE`);

    // 1. หยอดข้อมูลเซียมซี 17 ใบ
    console.log('🔮 กำลังบันทึกข้อมูลใบเซียมซี 17 ใบ...');
    await db.insert(fortunes).values([
      {
        number: 1,
        title: 'ใบที่ ๑ มหาโชคโภคทรัพย์',
        workFortune: 'งานราบรื่น ผู้ใหญ่คอยสนับสนุน',
        loveFortune: 'คนโสดพบมิตรแท้ คนมีคู่หวานชื่น',
        moneyFortune: 'คล่องตัว มีเกณฑ์รับเงินก้อน',
        studyFortune: 'สอบผ่านฉลุย สติปัญญาดี',
        healthFortune: 'แข็งแรง ไร้โรคภัยเบียดเบียน',
      },
      {
        number: 2,
        title: 'ใบที่ ๒ สติมาปัญญาเกิด',
        workFortune: 'มีอุปสรรคเล็กน้อย ต้องรอบคอบ',
        loveFortune: 'ใช้เหตุผลพูดคุย งดใช้อารมณ์',
        moneyFortune: 'ควรรอบคอบ งดเสี่ยงโชคช่วงนี้',
        studyFortune: 'ต้องขยันและทบทวนให้มากขึ้น',
        healthFortune: 'พักผ่อนให้พอ ระวังความเครียด',
      },
      {
        number: 3,
        title: 'ใบที่ ๓ ลาภลอยวาสนาดี',
        workFortune: 'โปรเจกต์สำเร็จเกินคาดหมาย',
        loveFortune: 'เสน่ห์แรง มีคนเข้าหาเยอะ',
        moneyFortune: 'การเงินหมุนเวียนดี มีลาภลอย',
        studyFortune: 'มีข่าวดีเรื่องการสอบหรือทุน',
        healthFortune: 'ระวังออฟฟิศซินโดรม ปวดหลัง',
      },
      {
        number: 4,
        title: 'ใบที่ ๔ เมตตามหานิยม',
        workFortune: 'เพื่อนร่วมงานช่วยดี เจรจาผ่าน',
        loveFortune: 'สดใส เข้าอกเข้าใจกันดี',
        moneyFortune: 'ปานกลาง มีผู้ใหญ่ซัพพอร์ต',
        studyFortune: 'ปรึกษาอาจารย์/เพื่อนจะผ่านได้ดี',
        healthFortune: 'ระวังสายตาและอาการปวดตา',
      },
      {
        number: 5,
        title: 'ใบที่ ๕ อดทนสร้างตัว',
        workFortune: 'พึ่งตัวเองเป็นหลัก จะสำเร็จงดงาม',
        loveFortune: 'เน้นสร้างความมั่นคงก่อนเปิดใจ',
        moneyFortune: 'ได้จากน้ำพักน้ำแรง ยิ่งขยันยิ่งได้',
        studyFortune: 'ต้องพยายามหนัก แต่ผ่านแน่นอน',
        healthFortune: 'ระวังระบบย่อย ทานอาหารตรงเวลา',
      },
      {
        number: 6,
        title: 'ใบที่ ๖ แคล้วคลาดปลอดภัย',
        workFortune: 'ปัญหาจะคลี่คลาย มีทางออก',
        loveFortune: 'เรียบง่าย อบอุ่น สม่ำเสมอ',
        moneyFortune: 'เริ่มฟื้นตัว ปลดหนี้ได้บางส่วน',
        studyFortune: 'ผ่านเกณฑ์ไปได้ด้วยดี',
        healthFortune: 'แข็งแรง ปลอดภัยจากอุบัติเหตุ',
      },
      {
        number: 7,
        title: 'ใบที่ ๗ ก้าวหน้ามั่นคง',
        workFortune: 'ได้เริ่มสิ่งใหม่ ขยับขยายงาน',
        loveFortune: 'มีเกณฑ์วางแผนอนาคตร่วมกัน',
        moneyFortune: 'ลงทุนคุ้มค่า มีโชคจากการเดินทาง',
        studyFortune: 'สมาธิดี เหมาะแก่การสอบแข่ง',
        healthFortune: 'กายใจสดชื่น สมบูรณ์แข็งแรง',
      },
      {
        number: 8,
        title: 'ใบที่ ๘ ฟื้นคืนสดใส',
        workFortune: 'งานที่ติดขัดจะกลับมาเดินหน้า',
        loveFortune: 'พบคนถูกใจจากการเดินทางหรือทำงาน',
        moneyFortune: 'ได้เงินคืน มีคนเลี้ยงข้าว',
        studyFortune: 'คะแนนดีตามที่ตั้งเป้าไว้',
        healthFortune: 'ระวังภูมิแพ้เมื่ออากาศเปลี่ยน',
      },
      {
        number: 9,
        title: 'ใบที่ ๙ ชัยชนะสมหวัง',
        workFortune: 'ชนะการแข่งขัน ได้เลื่อนขั้นตำแหน่ง',
        loveFortune: 'สมหวัง ได้คู่ครองที่ดีเคียงข้าง',
        moneyFortune: 'มีโชคใหญ่ การเงินมั่งคั่ง',
        studyFortune: 'ได้อันดับต้นๆ สอบผ่านง่ายดาย',
        healthFortune: 'สมบูรณ์แข็งแรง ปล่อยวางความกังวล',
      },
      {
        number: 10,
        title: 'ใบที่ ๑๐ พักกายพักใจ',
        workFortune: 'อย่าวู่วาม ควรรอเวลาที่เหมาะสม',
        loveFortune: 'อาจมีเรื่องขัดแย้ง หลีกเลี่ยงการปะทะ',
        moneyFortune: 'ระวังเงินรั่วไหล อย่าเพิ่งให้ใครยืม',
        studyFortune: 'ต้องตั้งสติ ไม่ประมาทในการทำข้อสอบ',
        healthFortune: 'ระวังไมเกรน นอนหลับให้เพียงพอ',
      },
      {
        number: 11,
        title: 'ใบที่ ๑๑ มิตรสหายเกื้อหนุน',
        workFortune: 'ได้กัลยาณมิตรช่วยงานจนสำเร็จ',
        loveFortune: 'เพื่อนพานำพาให้พบคนดีๆ',
        moneyFortune: 'มีรายได้เสริมเข้ามาจากคอนเนกชัน',
        studyFortune: 'ติวกับเพื่อนแล้วผลลัพธ์ดีเยี่ยม',
        healthFortune: 'สุขภาพดี มีคนรอบข้างดูแลใส่ใจ',
      },
      {
        number: 12,
        title: 'ใบที่ ๑๒ ย้ายยักเปลี่ยนแปลง',
        workFortune: 'โยกย้ายหรือเปลี่ยนงานแล้วจะดีขึ้น',
        loveFortune: 'ปรับตัวเข้าหากันจะผ่านไปได้ดี',
        moneyFortune: 'หมุนเวียนเร็ว ต้องวางแผนรายจ่าย',
        studyFortune: 'ปรับเทคนิคการเรียนแล้วคะแนนจะดีขึ้น',
        healthFortune: 'ระวังปวดกล้ามเนื้อจากการเดินทาง',
      },
      {
        number: 13,
        title: 'ใบที่ ๑๓ โชคลาภจากทิศเหนือ',
        workFortune: 'ติดต่องานต่างถิ่นจะสำเร็จลุล่วง',
        loveFortune: 'พบรักคนไกล หรือคนต่างภูมิภาค',
        moneyFortune: 'มีโชคลาภมาจากการเดินทาง',
        studyFortune: 'เรียนรู้สิ่งใหม่ๆ ได้รวดเร็ว',
        healthFortune: 'แข็งแรง สดชื่น กระปรี้กระเปร่า',
      },
      {
        number: 14,
        title: 'ใบที่ ๑๔ หมั่นทำบุญสร้างกุศล',
        workFortune: 'ทำดีได้ดี ผลงานเริ่มปรากฏชัดเจน',
        loveFortune: 'คู่บุญคู่บารมี สานสัมพันธ์ยั่งยืน',
        moneyFortune: 'ยิ่งแบ่งปัน ยิ่งได้รับโชคลาภกลับมา',
        studyFortune: 'สอบผ่านได้ด้วยความเพียรพยายาม',
        healthFortune: 'ไม่มีโรคหนัก ร่างกายผ่อนคลาย',
      },
      {
        number: 15,
        title: 'ใบที่ ๑๕ สมปรารถนาทุกประการ',
        workFortune: 'ราบรื่น ไร้อุปสรรคขัดขวาง',
        loveFortune: 'ราบรื่น มีความสุขตลอดวัน',
        moneyFortune: 'รับทรัพย์เต็มมือ โชคลาภพุ่งเข้าหา',
        studyFortune: 'ทำข้อสอบได้คะแนนสูงน่าพึงพอใจ',
        healthFortune: 'สุขภาพกายใจสมบูรณ์ 100%',
      },
      {
        number: 16,
        title: 'ใบที่ ๑๖ ระวังวาจา',
        workFortune: 'รอบคอบเรื่องเอกสารและคำพูด',
        loveFortune: 'คิดก่อนพูด ถนอมน้ำใจกันให้มาก',
        moneyFortune: 'ใช้จ่ายเท่าที่จำเป็น อย่าหลงเชื่อคำชวน',
        studyFortune: 'อ่านโจทย์ให้ละเอียดก่อนตอบ',
        healthFortune: 'ระวังเจ็บคอ ร้อนใน ดื่มน้ำมากๆ',
      },
      {
        number: 17,
        title: 'ใบที่ ๑๗ รุ่งเรืองโชติช่วง',
        workFortune: 'ชื่อเสียงโดดเด่น ได้รับการยอมรับ',
        loveFortune: 'เป็นที่รักใคร่เอ็นดูของคนรอบข้าง',
        moneyFortune: 'มั่งคั่ง มีเงินเก็บไม่ขาดมือ',
        studyFortune: 'ความจำดีเลิศ สอบได้คะแนนดีเยี่ยม',
        healthFortune: 'แข็งแรง มีพลังกายเต็มเปี่ยม',
      },
    ]);

    // 2. หยอดข้อมูลวันพระและวันมงคลตลอดทั้งปี 2569
    console.log('📅 กำลังบันทึกข้อมูลวันพระ/วันมงคลตลอดปี 2569 (2026)...');
    const formattedAuspiciousDays = auspiciousDaysData.map((item) => ({
      ...item,
      // แปลง object array เป็น string เพื่อความเข้ากันได้กับคอลัมน์ text
      recommendedActivities: typeof item.recommendedActivities === 'object'
        ? JSON.stringify(item.recommendedActivities)
        : item.recommendedActivities,
    }));
    await db.insert(auspiciousDays).values(formattedAuspiciousDays as any);

    console.log(`✅ Seed ข้อมูลสำเร็จ! (เซียมซี 17 ใบ และ วันพระ ${formattedAuspiciousDays.length} วัน)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการ seed ข้อมูล:', error);
    process.exit(1);
  }
}

seed();