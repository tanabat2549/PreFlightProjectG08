import { useEffect, useMemo, useRef, useState } from 'react';
import { mockFortunes } from '../data/mockFortunes';
import { type Fortune } from '../types/fortune';
import cylinderImg from '../assets/cylinder.png';
import stickImg from '../assets/stick.png';
import smokeImg from '../assets/smoke.png';
import lightImg from '../assets/light.png';
import './SiemseePage.css';

const STICK_COUNT = 17;

type Stage = 'idle' | 'shaking' | 'popping' | 'landed' | 'revealed';

// สุ่มเลขในช่วง [min, max]
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export default function SiemseePage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [picked, setPicked] = useState<Fortune | null>(null);
  const [showResult, setShowResult] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // เคลียร์ timer ถ้า component ถูก unmount กลางอนิเมชัน
  useEffect(() => clearTimers, []);

  // ป๊อปอัพเต็มจอแสดงอยู่ระหว่างที่ไม้ถูกเปิดเผยแล้ว แต่ยังไม่ได้กด "ดูใบเซียมซี"
  const overlayOpen = stage === 'revealed' && !showResult;

  // ล็อกการ scroll พื้นหลังตอนป๊อปอัพเต็มจอเปิดอยู่
  useEffect(() => {
    if (overlayOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [overlayOpen]);

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

  const isBusy = stage === 'shaking' || stage === 'popping';

  const handleShake = () => {
    if (isBusy) return;
    clearTimers();
    setShowResult(false);

    // สุ่มผลตั้งแต่ตอนกดปุ่มเลย แต่ "เลข" จะยังไม่ถูกเปิดเผยบนไม้
    // จนกว่าไม้จะหล่นและหยุดนิ่ง (ดู stage 'revealed' ด้านล่าง)
    const fortune = mockFortunes[Math.floor(Math.random() * mockFortunes.length)];
    setPicked(fortune);
    setStage('shaking');

    // Idle -> shaking -> popping -> landed -> revealed (เปิดป๊อปอัพเต็มจอ)
    timers.current.push(setTimeout(() => setStage('popping'), 900));
    timers.current.push(setTimeout(() => setStage('landed'), 900 + 700));
    timers.current.push(setTimeout(() => setStage('revealed'), 900 + 700 + 450));
  };

  const handleReset = () => {
    clearTimers();
    setStage('idle');
    setPicked(null);
    setShowResult(false);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--primary-red)' }}>🥠 เขย่าเซียมซี</h2>
      <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '8px' }}>
        ตั้งจิตอธิษฐานแล้วกดปุ่มเพื่อเขย่ากระบอกเซียมซี
      </p>

      <div className="siemsee-stage">
        {/* เงา */}
        <div className="shadow-layer" />

        {/* กระบอก */}
        <div className={`cylinder-layer ${stage === 'shaking' ? 'shake' : ''}`}>
          <img src={cylinderImg} alt="กระบอกเซียมซี" draggable={false} />
        </div>

        {/* มัดไม้ 17 แท่งที่โผล่พ้นปากกระบอก */}
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

        {/* ควัน — โผล่ตอนไม้เด้งออกมา */}
        <div className={`smoke-layer ${stage === 'popping' ? 'puff' : ''}`}>
          <img src={smokeImg} alt="" draggable={false} />
        </div>

        {/* ไม้ที่เด้งออกมา บนเวทีเล็ก — เด้งแล้วตกลงมา ก่อนสลับไปเวอร์ชันเต็มจอ */}
        {stage !== 'idle' && (
          <div className={`popped-stick ${stage}`}>
            <img src={stickImg} alt="ไม้เซียมซี" draggable={false} />
            <div className={`glow-layer ${stage === 'landed' || stage === 'revealed' ? 'show' : ''}`}>
      
            </div>
            <span className={`stick-number ${stage === 'revealed' ? 'show' : ''}`}>
              {picked?.number}
            </span>
          </div>
        )}
      </div>

      {stage !== 'revealed' && (
        <div style={{ marginTop: '20px' }}>
          <button
            className="btn-gold"
            onClick={handleShake}
            disabled={isBusy}
            style={{ width: '80%', fontSize: '16px', cursor: isBusy ? 'not-allowed' : 'pointer' }}
          >
            {stage === 'idle' ? 'กดเพื่อเขย่าเซียมซี' : 'กำลังเขย่า...'}
          </button>
        </div>
      )}

      {/* ===== ป๊อปอัพเต็มจอ — ไม้ขนาดใหญ่ + เลข + แสงหมุนวนไม่หยุด ===== */}
      {overlayOpen && (
        <div className="reveal-overlay">
          <div className="reveal-stick-stage">
            <div className="reveal-glow">
              <img src={lightImg} alt="" draggable={false} />
            </div>
            <div className="reveal-stick">
              <img src={stickImg} alt="ไม้เซียมซี" draggable={false} />
              <span className="reveal-number">{picked?.number}</span>
            </div>
          </div>

          <p className="reveal-caption">เซียมซีใบที่ {picked?.number}</p>

          <button
            className="btn-gold reveal-btn"
            onClick={() => setShowResult(true)}
            style={{ fontSize: '16px' }}
          >
            ดูใบเซียมซี
          </button>
        </div>
      )}

      {showResult && picked && (
        <div className="talisman-card" style={{ marginTop: '24px', textAlign: 'left' }}>
          <div
            style={{
              textAlign: 'center',
              marginBottom: '16px',
              borderBottom: '1px dashed var(--primary-gold)',
              paddingBottom: '12px',
            }}
          >
            <h3 style={{ fontSize: '20px', color: 'var(--primary-red)', margin: 0 }}>
              ✨ {picked.title}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-main)' }}>
            <p style={{ margin: 0 }}>💼 <strong>การงาน:</strong> {picked.workFortune}</p>
            <p style={{ margin: 0 }}>❤️ <strong>ความรัก:</strong> {picked.loveFortune}</p>
            <p style={{ margin: 0 }}>💰 <strong>การเงิน:</strong> {picked.moneyFortune}</p>
            <p style={{ margin: 0 }}>🎓 <strong>การเรียน:</strong> {picked.studyFortune}</p>
            <p style={{ margin: 0 }}>🏥 <strong>สุขภาพ:</strong> {picked.healthFortune}</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={handleReset}
              style={{
                background: 'none',
                border: '1px solid var(--primary-gold)',
                color: 'var(--primary-gold)',
                borderRadius: '16px',
                padding: '8px 20px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              เขย่าอีกครั้ง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}