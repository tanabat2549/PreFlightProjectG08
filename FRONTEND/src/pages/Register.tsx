import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import './Login.css'; // ใช้ style ร่วมกับหน้า login

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }
    if (!agree) {
      setError('กรุณายอมรับเงื่อนไขการใช้งานก่อนสมัครสมาชิก');
      return;
    }

    setLoading(true);
    try {
      // 🔗 TODO: เชื่อมกับ backend จริงตอน integrate
      // const res = await register({ name, phone, password });
      await new Promise((r) => setTimeout(r, 600)); // จำลอง delay
      navigate('/login');
    } catch (err) {
      setError('สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
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

        <h1 className="login-title">สมัครสมาชิก</h1>
        <p className="login-subtitle">เริ่มต้นเส้นทางแห่งบุญไปด้วยกัน</p>

        {error && <p className="login-error">⚠️ {error}</p>}

        <div className="login-field">
          <label htmlFor="name">ชื่อ-นามสกุล</label>
          <input
            id="name"
            type="text"
            placeholder="กรอกชื่อ-นามสกุล"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className="login-field">
          <label htmlFor="phone">เบอร์โทรศัพท์</label>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            placeholder="0XX-XXX-XXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">รหัสผ่าน</label>
          <div className="login-password-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="login-eye-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="login-field">
          <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className="login-row" style={{ marginBottom: '20px' }}>
          <label className="login-remember">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span>
              ยอมรับ <a href="/terms" className="login-forgot">เงื่อนไขการใช้งาน</a>
            </span>
          </label>
        </div>

        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
        </button>

        <p className="login-register-hint">
          มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </div>
  );
}