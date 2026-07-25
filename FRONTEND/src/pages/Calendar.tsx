export default function Calendar() {
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