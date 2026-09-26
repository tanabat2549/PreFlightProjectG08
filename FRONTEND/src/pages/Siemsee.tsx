import { useEffect, useMemo, useRef, useState } from 'react';
import { drawFortune } from '../api/siemsee';
import { type Fortune } from '../types/fortune';
import cylinderImg from '../assets/cylinder.png';
import stickImg from '../assets/stick.png';
import smokeImg from '../assets/smoke.png';
import lightImg from '../assets/light.png';
import './SiemseePage.css';

// Minimal SVG Icons
const Icons = {
  Sparkles: ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </svg>
  ),
  Briefcase: ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Coins: ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="m7 6 2 2-2 2" />
    </svg>
  ),
  Heart: ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  GraduationCap: ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.42 10.922a1 1 0 0 0-.019-.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 10.084a1 1 0 0 0 0 1.832l8.57 4.908a2 2 0 0 0 1.66 0l8.57-4.908a1 1 0 0 0 .02-.994Z" />
      <path d="M6 13v4a6 3 0 0 0 12 0v-4" />
    </svg>
  ),
  Activity: ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  BookOpen: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  RotateCcw: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  AlertCircle: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
};

const toThaiNumber = (num: number | string | undefined) => {
  if (num === undefined || num === null) return '';
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return num.toString().replace(/\d/g, (d) => thaiDigits[parseInt(d, 10)]);
}

const STICK_COUNT = 17;

type Stage = 'idle' | 'loading' | 'shaking' | 'popping' | 'landed' | 'revealed';

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export default function SiemseePage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [picked, setPicked] = useState<Fortune | null>(null);
  const [showFullStickModal, setShowFullStickModal] = useState(false); // Step 2[cite: 21]
  const [isSplitView, setIsSplitView] = useState(false); // Step 3[cite: 21]
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  // ล็อค Scroll ตอนขึ้น Step 2 เต็มจอ[cite: 21]
  useEffect(() => {
    if (showFullStickModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showFullStickModal]);

  const stickVars = useMemo(
    () =>
      Array.from({ length: STICK_COUNT }).map(() => ({
        '--rot': `${rand(-6, 6).toFixed(2)}deg`,
        '--dx': `${rand(-30, 30).toFixed(1)}px`,
        '--dy': `${rand(-4, 4).toFixed(1)}px`,
        '--h': `${rand(160, 180).toFixed(0)}px`,
        '--b': rand(0.88, 1.05).toFixed(2),
        '--delay': `${rand(0, 0.12).toFixed(2)}s`,
      })) as React.CSSProperties[],
    []
  );

  const isBusy = stage === 'loading' || stage === 'shaking' || stage === 'popping'; //[cite: 21]

  // Step 1 -> เด้งไม้ -> เปิด Step 2[cite: 21]
  const handleShake = async () => {
    if (isBusy) return;
    clearTimers();
    setIsSplitView(false);
    setShowFullStickModal(false);
    setError(null);
    setStage('loading');

    try {
      const fortune = await drawFortune();
      setPicked(fortune);
      setStage('shaking');

      timers.current.push(setTimeout(() => setStage('popping'), 850));
      timers.current.push(setTimeout(() => setStage('landed'), 850 + 650));
      timers.current.push(
        setTimeout(() => {
          setStage('revealed');
          setShowFullStickModal(true);
        }, 850 + 650 + 400)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
      setStage('idle');
    }
  };

  // Step 2 -> Step 3: กดเปิดอ่านคำทำนาย แล้วคลี่ออก 2 ฝั่ง[cite: 21]
  const handleOpenFortune = () => {
    setShowFullStickModal(false);
    setIsSplitView(true);
  };

  // รีเซ็ตเพื่อเขย่าใหม่[cite: 21]
  const handleReset = () => {
    clearTimers();
    setStage('idle');
    setPicked(null);
    setShowFullStickModal(false);
    setIsSplitView(false);
    setError(null);
  };

  return (
    <div className={`siemsee-page-container ${isSplitView ? 'layout-split-active' : ''}`}>
      {/* ส่วนหัวของหน้าเว็บ */}
      <header className="siemsee-header-wrap">
        <h2>
          <span className="shaking-title">เขย่าเซียมซี</span>
        </h2>
        <p className="siemsee-subtitle">
          {isSplitView
            ? 'คำทำนายดวงชะตาและสารธรรมเตือนสติตามใบเซียมซีที่ท่านได้รับ'
            : 'ตั้งจิตอธิษฐานนึกถึงสิ่งที่ต้องการถาม แล้วกดปุ่มเพื่อเขย่าเซียมซี'}
        </p>
        {error && (
          <p className="siemsee-error-text">
            <Icons.AlertCircle size={15} color="#F87171" />
            <span>{error}</span>
          </p>
        )}
      </header>

      {/* =========================================================================
          STEP 1: หน้าจอเขย่าเต็มจอตรงกลาง (กระบอก + ไม้เริ่มเด้ง)
          ========================================================================= */}
      {!isSplitView && (
        <div className="siemsee-center-fullscreen-stage">
          <div className="siemsee-stage">
            <div className="shadow-layer" />

            <div className={`cylinder-layer ${stage === 'shaking' ? 'shake' : ''}`}>
              <img src={cylinderImg} alt="กระบอกเซียมซี" draggable={false} />
            </div>

            <div className="stick-bundle-wrap">
              {stickVars.map((vars, i) => (
                <div
                  key={i}
                  className={`stick-in-bundle ${stage === 'shaking' ? 'jitter' : ''}`}
                  style={vars}
                >
                  <img src={stickImg} alt="" draggable={false} />
                </div>
              ))}
            </div>

            <div className={`smoke-layer ${stage === 'popping' ? 'puff' : ''}`}>
              <img src={smokeImg} alt="" draggable={false} />
            </div>

            {stage !== 'idle' && stage !== 'loading' && (
              <div className={`popped-stick ${stage}`}>
                <img src={stickImg} alt="ไม้เซียมซี" draggable={false} />
                <div className={`glow-layer ${stage === 'landed' || stage === 'revealed' ? 'show' : ''}`} />
                <span className={`stick-number ${stage === 'revealed' ? 'show' : ''}`}>
                  {picked?.number}
                </span>
              </div>
            )}
          </div>

          <div className="siemsee-btn-wrap">
            <button
              className="btn-gold siemsee-action-btn"
              onClick={handleShake}
              disabled={isBusy}
            >
              {stage === 'idle' && 'กดเพื่อเขย่าเซียมซี'}
              {stage === 'loading' && 'กำลังเชื่อมต่อจิต...'}
              {(stage === 'shaking' || stage === 'popping') && 'กำลังเขย่ากระบอก...'}
              {stage === 'revealed' && 'เขย่าอีกครั้ง'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: MODAL แสดงผลไม้เซียมซีขนาดเต็มจอ + แสงหมุน + ปุ่มเปิดอ่านคำทำนาย
          ========================================================================= */}
      {showFullStickModal && picked && (
        <div className="reveal-overlay">
          <div className="reveal-stick-stage">
            <div className="reveal-stick">
              <img src={stickImg} alt="ไม้เซียมซี" draggable={false} />
              <span className="reveal-number">{picked.number}</span>
            </div>
          </div>

          <button
            className="btn-gold reveal-btn"
            onClick={handleOpenFortune}
          >
            <Icons.BookOpen size={18} />
            <span>เปิดอ่านคำทำนาย</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          STEP 3: แยก 2 ฝั่ง (SPLIT SCREEN REVEAL)
          ========================================================================= */}
      {isSplitView && picked && (
        <div className="siemsee-split-container">
          
          {/* 🌟 ฝั่งซ้าย: แท่งไม้เซียมซี + ออร่าหมุน + ปุ่มเสี่ยงเซียมซีใหม่ */}
          <section className="split-left-stick-panel">
            <div className="pure-stick-stage">
              <div className="stick-rotating-aura">
                <img src={lightImg} alt="ออร่าแสง" draggable={false} />
              </div>
              
              <div className="pure-stick-wrapper">
                <img src={stickImg} alt="ไม้เซียมซี" draggable={false} />
                <span className="stick-embedded-number">{picked.number}</span>
              </div>

              {/* 🔘 ย้ายปุ่ม "เสี่ยงเซียมซีใหม่" มาไว้ใต้แท่งไม้ฝั่งซ้าย */}
              <div className="stick-action-wrap">
                <button
                  type="button"
                  className="btn-action-talisman reshake-btn-left"
                  onClick={handleReset}
                >
                  <Icons.RotateCcw size={15} />
                  <span>เสี่ยงเซียมซีใหม่</span>
                </button>
              </div>
            </div>
          </section>

          {/* 📜 ฝั่งขวา: ใบเซียมซีคำทำนาย (เหลือปุ่ม เก็บใบเซียมซี และ ทิ้งเซียมซี) */}
          <section className="split-right-fortune-panel">
            <div className="chinese-paper-talisman">
              
              {/* 🏷️ ป้ายแถบสีแดงด้านบน */}
              <div className="chinese-talisman-top-banner">
                <span className="talisman-banner-number">
                  ใบที่ {toThaiNumber(picked.number)}
                </span>
                <h3 className="talisman-banner-title">
                  {picked.title.replace(/^ใบที่\s*\d+\s*/, '')}
                </h3>
              </div>

              {/* 📜 เนื้อหาคำทำนายทั้ง 5 ด้าน */}
              <div className="chinese-talisman-content">
                <div className="chinese-fortune-item">
                  <div className="chinese-fortune-badge">
                    <Icons.Briefcase size={15} color="#7A1C28" />
                    <span>การงาน</span>
                  </div>
                  <p className="chinese-fortune-desc">{picked.workFortune}</p>
                </div>

                <div className="chinese-fortune-item">
                  <div className="chinese-fortune-badge">
                    <Icons.Coins size={15} color="#7A1C28" />
                    <span>การเงิน</span>
                  </div>
                  <p className="chinese-fortune-desc">{picked.moneyFortune}</p>
                </div>

                <div className="chinese-fortune-item">
                  <div className="chinese-fortune-badge">
                    <Icons.Heart size={15} color="#7A1C28" />
                    <span>ความรัก</span>
                  </div>
                  <p className="chinese-fortune-desc">{picked.loveFortune}</p>
                </div>

                <div className="chinese-fortune-item">
                  <div className="chinese-fortune-badge">
                    <Icons.GraduationCap size={15} color="#7A1C28" />
                    <span>การเรียน</span>
                  </div>
                  <p className="chinese-fortune-desc">{picked.studyFortune}</p>
                </div>

                <div className="chinese-fortune-item">
                  <div className="chinese-fortune-badge">
                    <Icons.Activity size={15} color="#7A1C28" />
                    <span>สุขภาพ</span>
                  </div>
                  <p className="chinese-fortune-desc">{picked.healthFortune}</p>
                </div>
              </div>

              {/* 🔘 ปุ่มควบคุมฝั่งขวา: เก็บใบเซียมซี และ ทิ้งเซียมซี */}
              <div className="chinese-talisman-action-group">
                <button
                  type="button"
                  className="btn-talisman-action btn-talisman-save"
                  onClick={() => {
                    alert('บันทึกใบเซียมซีลงในประวัติสำเร็จ');
                  }}
                >
                  <Icons.Sparkles size={15} color="#FDF6E2" />
                  <span>เก็บใบเซียมซี</span>
                </button>

                <button
                  type="button"
                  className="btn-talisman-action btn-talisman-discard"
                  onClick={handleReset}
                >
                  <Icons.RotateCcw size={14} color="#8C3B3B" />
                  <span>ทิ้งเซียมซี</span>
                </button>
              </div>

            </div>
          </section>

        </div>
      )}
    </div>
  );
}