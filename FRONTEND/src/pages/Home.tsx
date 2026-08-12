import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      {/* Header Section */}
      <header className="home-header">
        <div className="header-text">
          <h2>สวัสดีตอนเช้า ☀️</h2>
          <p>ขอให้วันนี้เป็นวันที่ดีและมีบุญ</p>
        </div>
        <div className="temple-stamp">
          <span>วัดไทย</span>
        </div>
      </header>

      {/* Hero Daily Siemsee Card */}
      <section className="siemsee-banner">
        <div className="banner-badge">แนะนำประจำวัน</div>
        <div className="banner-content">
          <div className="banner-icon">🥠</div>
          <h3>เซียมซีประจำวัน</h3>
          <p>เสี่ยงทายโชคชะตาประจำวันนี้เพื่อรับคำแนะนำและข้อคิดในการดำเนินชีวิต</p>
          <Link to="/siemsee" className="btn-siemsee">
            เสี่ยงทายเลย
          </Link>
        </div>
      </section>

      {/* Nearby Temples Section */}
      <section className="temples-section">
        <div className="section-header">
          <h3>🛕 วัดใกล้คุณ</h3>
          <Link to="/temples" className="link-more">ดูทั้งหมด</Link>
        </div>

        <div className="temple-card">
          <div className="temple-img-wrapper">
            🏛️
          </div>
          <div className="temple-info">
            <h4>วัดพระธาตุดอยสุเทพ</h4>
            <div className="temple-meta">
              <span className="distance">📍 2.4 กม.</span>
              <span className="rating">⭐ 4.8 <small>(128 รีวิว)</small></span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}