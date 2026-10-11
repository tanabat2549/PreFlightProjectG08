import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is missing!');
}
const genAI = new GoogleGenerativeAI(apiKey || '');
export interface FortuneStick {
  number: number;
  title: string;
  description?: string | null;
  workFortune?: string | null;
  loveFortune?: string | null;
  moneyFortune?: string | null;
  studyFortune?: string | null;
  healthFortune?: string | null;
}

export interface UserProfile {
  name: string;
  ageRange?: string;
  gender?: string;
  status?: string;
  relationship?: string;
  concern?: string;
}

export interface SiamsiResult {
  text: string;
  isAiGenerated: boolean;
  copyRatio: number;
  attempts: number;
  modelUsed: string;
  toneOk: boolean;
}

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const COPY_THRESHOLD = 0.25;
const MAX_ATTEMPTS = 3;
const SYSTEM_INSTRUCTION = `
คุณคือเพื่อนรุ่นใหม่ที่เก่งเรื่องดูเซียมซี เวลาเพื่อนสุ่มใบเซียมซีได้มา คุณช่วยอธิบายขยายความให้ฟังแบบเป็นกันเอง สุภาพ อบอุ่น ไม่ใช่พระ ไม่ใช่หมอดูขรึมๆ ไม่ใช่ผู้ใหญ่สอนสั่ง

โทนเสียงที่ต้องการ (สำคัญมาก):
- พูดแบบคนรุ่นใหม่คุยกันในชีวิตประจำวัน เป็นกันเองแต่สุภาพ ฟังดูน่าเชื่อถือ ไม่กวนหรือจัดจ้านเกินไป
- ใช้คำสมัยใหม่แบบนุ่มนวล เช่น "ช่วงนี้", "ชิลๆ", "เอาใจช่วย", "ไปได้สวย", "ลองดูนะ", "ระวังนิดนึง", "น่าจะดีขึ้น", "ค่อยเป็นค่อยไป", "มั่นใจได้เลย"
- ใช้คำลงท้ายที่เป็นมิตรแบบคนคุ้นเคย เช่น "นะ", "เนอะ", "น้า" ใส่ emoji ได้พอประมาณ ไม่ต้องเยอะจนรก
- โทนเป็นเพื่อนที่ห่วงใยและให้กำลังใจ พูดตรงประเด็น กระชับ อ่านแล้วรู้สึกอบอุ่นสบายใจ
- หลีกเลี่ยงสแลงที่ฟังดูกวนหรือหยาบเกินไป (เช่น "อิหยังวะ") แม้จะเป็นคำร่วมสมัยก็ตาม

หน้าที่ของคุณ:
- นำความหมายดั้งเดิมของใบเซียมซีที่ได้มาอธิบายขยายความให้ลึกขึ้น ไม่ใช่แค่สรุปสั้นห้วนๆ
- เชื่อมโยงความหมายเข้ากับสถานการณ์จริงของคนอ่าน ให้คำแนะนำที่เอาไปใช้ได้จริง
- แต่ละหมวดเขียน 2 ประโยค: ประโยคแรกขยายความหมายจากใบเซียมซี ประโยคสองแนะนำว่าควรทำยังไงต่อ

ข้อห้ามเด็ดขาด:
- ห้ามแต่งเป็นกลอน บทกวี หรือฉันทลักษณ์ใดๆ ทั้งสิ้นเด็ดขาด ไม่ว่าจะเป็นกลอนแปด กาพย์ หรือร้อยกรองรูปแบบใดก็ตาม ต้องเป็นร้อยแก้วล้วนเท่านั้น
- ห้ามเล่นบทบาทพระสงฆ์หรือนักบวชเด็ดขาด ห้ามใช้คำว่า "โยม", "อาตมา", "เจริญพร", "อาราธนา", "คุณพระศรีรัตนตรัย", "สาธุ", "เทอญ", "ในธรรม", "ทางโลก"
- ห้ามคัดลอกข้อความจากต้นฉบับเกิน 4 คำติดกัน
- ห้ามใช้คำหรือสำนวนโบราณ/ทางการจัด/ราชาศัพท์เด็ดขาด เช่น "ดุจดั่ง", "จักได้", "อันว่า", "ย่อม", "บังเกิด", "ขวากหนาม", "ท่าน", "มิได้", "หาไม่", "แต่ทว่า", "เยี่ยงอย่าง", "ปางก่อน", "เสวย", "กอปรด้วย", "ครั้นแล้ว", "พึง", "ใคร่", "ณ เวลานี้", "แห่งตน", "ผู้ใด", "สิ่งใด"
- ห้ามใช้คำวัยรุ่นเก่าล้าสมัย เช่น "จ๊าบ", "อลังการ", "เริ่ด"
- ห้ามใช้โครงสร้างประโยคแบบร้อยแก้วโบราณ (ห้ามลงท้ายด้วย "แล", "นะแล", "เอย", "หนอ", "เถิด")
- ห้ามทำนายเรื่องตัวเลข หวย การพนัน หรือการลงทุนการันตีผลตอบแทน
- ความยาวรวมทั้งหมดอยู่ระหว่าง 150-250 คำ ไม่สั้นห้วนเกินไปและไม่ยาวเยิ่นเย้อ
- ตอบเฉพาะเนื้อคำทำนาย ห้ามมีคำนำหรือคำอธิบายวิธีคิด
`.trim();

const ARCHAIC_PATTERNS: RegExp[] = [

  /เจริญพร/, /โยม(?![ก-๙])/, /อาตมา/, /อาราธนา/, /คุณพระศรีรัตนตรัย/, /สาธุ/,
  /เทอญ/, /ในธรรม/, /ทางโลก/,

  /ดุจดั่ง/, /จักได้/, /อันว่า/, /ย่อม/, /บังเกิด/, /ขวากหนาม/,
  /มิได้/, /หาไม่/, /แต่ทว่า/, /เป็นนิรันดร์/, /เยี่ยงอย่าง/, /ปางก่อน/, /เสวย/,
  /กอปรด้วย/, /ครั้นแล้ว/, /พึง(?=[ก-๙])/, /ใคร่(?=[ก-๙])/, /ณ เวลานี้/, /แห่งตน/,
  /ผู้ใด/, /สิ่งใด/, /แล$/, /นะแล/, /เอย$/, /หนอ/, /เถิด/, /ท่านผู้/, /ทั้งนี้ทั้งนั้น/,
  // คำวัยรุ่นเก่าล้าสมัย
  /จ๊าบ/, /เริ่ดอลังการ/,
  // 🆕 สแลงที่กวน/หยาบเกินไปสำหรับโทนสุภาพรอบนี้
  /อิหยังวะ/, /เมพ/, /จุงเบย/, /ปึ้ก/, /เท่ป้ะ/, /จบป่ะ/,
];

function containsArchaicLanguage(text: string): boolean {
  return ARCHAIC_PATTERNS.some((pattern) => pattern.test(text));
}

// 🆕 เช็คว่าแต่งเป็นกลอนไหม — สัญญาณคือมีสัมผัสคล้องจองและจังหวะคำซ้ำแบบฉันทลักษณ์
// (เช็คแบบหยาบๆ จากรูปแบบที่พบบ่อย: บรรทัดสั้นๆ ติดกันหลายบรรทัดความยาวใกล้เคียงกัน)
function looksLikePoetry(text: string): boolean {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 4) return false;

  // นับบรรทัดที่สั้น (ลักษณะวรรคกลอน) ติดกันหลายบรรทัด
  const shortLines = lines.filter((l) => l.length > 0 && l.length <= 25 && !l.includes(':'));
  return shortLines.length >= 4;
}

const MIN_CHAR_LENGTH = 300;
const MAX_CHAR_LENGTH = 900;

function isBadLength(text: string): boolean {
  return text.length < MIN_CHAR_LENGTH || text.length > MAX_CHAR_LENGTH;
}

function normalize(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

export function calcCopyRatio(aiText: string, stick: FortuneStick): number {
  const raw = normalize(
    [
      stick.description,
      stick.workFortune,
      stick.loveFortune,
      stick.moneyFortune,
      stick.studyFortune,
      stick.healthFortune,
    ]
      .filter(Boolean)
      .join(' ')
  );
  if (!raw) return 0;
  const ai = normalize(aiText);
  const words = raw.split(' ').filter(Boolean);
  if (words.length < 4) return 0;

  const grams: string[] = [];
  for (let i = 0; i <= words.length - 4; i++) {
    grams.push(words.slice(i, i + 4).join(' '));
  }
  const hit = grams.filter((g) => ai.includes(g)).length;
  return hit / grams.length;
}

function buildPrompt(stick: FortuneStick, user: UserProfile): string {
  return `
<raw_oracle>
ใบที่ ${stick.number}: ${stick.title}
ภาพรวม: ${stick.description || '-'}
การงาน: ${stick.workFortune || '-'}
ความรัก: ${stick.loveFortune || '-'}
การเงิน: ${stick.moneyFortune || '-'}
การเรียน: ${stick.studyFortune || '-'}
สุขภาพ: ${stick.healthFortune || '-'}
</raw_oracle>
<user_profile>

ชื่อ: ${user.name}
ช่วงวัย: ${user.ageRange || 'ไม่ระบุ'}
สถานะ: ${user.status || 'ไม่ระบุ'}
สถานะความสัมพันธ์: ${user.relationship || 'ไม่ระบุ'}
เรื่องที่กังวล: ${user.concern || 'ไม่ระบุ'}
</user_profile>
ตอบตามรูปแบบนี้เท่านั้น (เป็นกันเอง สุภาพ อบอุ่น ห้ามแต่งเป็นกลอนเด็ดขาด ห้ามใช้คำโบราณหรือคำแบบพระสงฆ์ แต่ละหมวดขยายความหมายจากต้นฉบับ 2 ประโยค เป็นร้อยแก้วล้วน รวมทั้งหมด 150-250 คำ):
สวัสดี ${user.name} 😊 เซียมซีใบที่ ${stick.number} (${stick.title}) ออกมาแล้วนะ
🌟 ภาพรวม: [ขยายความหมายจากต้นฉบับ + สิ่งที่ควรระวังหรือทำ]
💼 งาน: [ขยายความหมายจากต้นฉบับ + คำแนะนำที่ทำได้จริง]
💖 ความรัก: [ขยายความหมายจากต้นฉบับ + คำแนะนำที่ทำได้จริง]
💰 การเงิน: [ขยายความหมายจากต้นฉบับ + คำแนะนำที่ทำได้จริง]
🎓 เรียน/พัฒนาตัวเอง: [ขยายความหมายจากต้นฉบับ + คำแนะนำที่ทำได้จริง]
🏥 สุขภาพ: [ขยายความหมายจากต้นฉบับ + คำแนะนำที่ทำได้จริง]
✨ สรุปให้กำลังใจ: [1-2 ประโยค เน้นเรื่องที่กังวล แบบเพื่อนห่วงใยเพื่อน]

`.trim();
}

export async function generatePersonalizedSiamsi(
  stick: FortuneStick,
  user: UserProfile
): Promise<SiamsiResult> {

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.85, // 🆕 ลดลงจาก 1.0 — โทนสุภาพนุ่มนวลต้องการความสม่ำเสมอมากกว่าความจัดจ้าน
      topP: 0.95,
      maxOutputTokens: 1000,
    },
  });
  let lastText = '';
  let lastRatio = 1;
  let lastToneOk = false;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await model.generateContent(buildPrompt(stick, user));
    const text = result.response.text()?.trim();
    if (!text) continue;

    const ratio = calcCopyRatio(text, stick);
    // 🆕 เพิ่มเช็ค looksLikePoetry คู่กับของเดิม — กันกลอนหลุดมาอีกชั้น
    const toneOk = !containsArchaicLanguage(text) && !isBadLength(text) && !looksLikePoetry(text);

    lastText = text;
    lastRatio = ratio;
    lastToneOk = toneOk;

    if (ratio <= COPY_THRESHOLD && toneOk) {
      return {
        text,
        isAiGenerated: true,
        copyRatio: ratio,
        attempts: attempt,
        modelUsed: MODEL_NAME,
        toneOk: true,
      };
    }
  }

  return {
    text: lastText,
    isAiGenerated: true,
    copyRatio: lastRatio,
    attempts: MAX_ATTEMPTS,
    modelUsed: MODEL_NAME,
    toneOk: lastToneOk,
  };

}
export function buildFallbackText(stick: FortuneStick, userName: string): string {
  return [
    `สวัสดี ${userName} 😊 เซียมซีใบที่ ${stick.number} (${stick.title}) ออกมาแล้วนะ`,
    '',

    `🌟 ภาพรวม: ${stick.description || '-'}`,
    `💼 การงาน: ${stick.workFortune || '-'}`,
    `💖 ความรัก: ${stick.loveFortune || '-'}`,
    `💰 การเงิน: ${stick.moneyFortune || '-'}`,
    `🎓 การเรียน: ${stick.studyFortune || '-'}`,
    `🏥 สุขภาพ: ${stick.healthFortune || '-'}`,

  ].join('\n');

}