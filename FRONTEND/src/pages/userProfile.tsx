export default function userProfile() {
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