export default function Temple() {
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