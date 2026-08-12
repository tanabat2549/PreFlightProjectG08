import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png'; // 👉 เซฟรูปโลโก้ที่ส่งมาไว้ที่ path นี้
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim() || !password.trim()) {
      setError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      // 🔗 TODO: เชื่อมกับ backend จริงตอน integrate
      // const res = await login(phone, password);
      await new Promise((r) => setTimeout(r, 600)); // จำลอง delay
      navigate('/');
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-glow" />

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo-wrap">
          <img src={logoImg} alt="ขอส่วนบุญ" className="login-logo" draggable={false} />
        </div>

        <h1 className="login-title">เข้าสู่ระบบ</h1>
        <p className="login-subtitle">ตั้งจิตอธิษฐาน แล้วเข้าสู่เส้นทางแห่งบุญ</p>

        {error && <p className="login-error">⚠️ {error}</p>}

        <div className="login-field">
          <label htmlFor="phone">อีเมล</label>
          <input
            id="phone"
            type="email"
            inputMode="email"
            placeholder="example@email.com"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">รหัสผ่าน</label>
          <div className="login-password-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login-eye-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {showPassword ? 'X' : '👁️'}
            </button>
          </div>
        </div>

        <div className="login-row">
          <label className="login-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>จดจำฉันไว้</span>
          </label>
          <a href="/forgot-password" className="login-forgot">
            ลืมรหัสผ่าน?
          </a>
        </div>

        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>

        <div className="login-divider">
          <span>หรือ</span>
        </div>

        <button type="button" className="login-guest-btn" onClick={() => navigate('/')}>
          เข้าใช้งานแบบไม่ระบุตัวตน
        </button>

        <p className="login-register-hint">
          ยังไม่มีบัญชี? <a href="/register">สมัครสมาชิก</a>
        </p>
      </form>
    </div>
  );
}