import { Link } from 'react-router-dom';

export default function Home() {
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