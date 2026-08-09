import React, { useState } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { api } from '../services/api';
import './userProfile.css';

interface UserData {
  name: string;
  email: string;
  picture?: string;
  gender?: string;
  birthday?: string;
  zodiacSign?: string;
  birthDayOfWeek?: string;
  bio?: string;
}

interface SiamsiHistoryItem {
  id: string;
  date: string;
  stickNumber: number;
  prediction: string;
  tag?: string;
  
}

interface TempleReview {
  id: string;
  temple: string;
  rating: number;
  comment: string;
  date: string;
}

type TabKey = 'info' | 'history' | 'reviews';

// ---------- Mock Data ----------
const MOCK_HISTORY: SiamsiHistoryItem[] = [
  {
    id: 'h1',
    date: '2569-04-12',
    stickNumber: 7,
    prediction: 'สิ่งที่หวังไว้จะสำเร็จได้ด้วยความอดทน อย่าเพิ่งท้อถอยในช่วงนี้ โชคลาภจะมาในเดือนหน้า',
    tag: 'การงาน/โชคลาภ'
    
  },
  {
    id: 'h2',
    date: '2569-03-02',
    stickNumber: 5,
    prediction: 'การงานมีอุปสรรคเล็กน้อย แต่ผลลัพธ์สุดท้ายจะออกมาดี ให้ระมัดระวังเรื่องคำพูด',
    tag: 'การงาน'
  },
  {
    id: 'h3',
    date: '2569-01-18',
    stickNumber: 17,
    prediction: 'สุขภาพเป็นเรื่องที่ควรใส่ใจ พักผ่อนให้เพียงพอ เรื่องเงินทองมั่นคงดี',
    tag: 'สุขภาพ/การเงิน'
  
  },
];

const MOCK_REVIEWS: TempleReview[] = [
  {
    id: 'r1',
    temple: 'วัดพระธาตุดอยสุเทพ',
    rating: 5,
    comment: 'บรรยากาศดีมาก วิวสวย พระธาตุงดงาม เดินทางสะดวก',
    date: '2569-04-12',
  },
  {
    id: 'r2',
    temple: 'วัดเจดีย์หลวง',
    rating: 4,
    comment: 'เงียบสงบ เหมาะแก่การไหว้พระทำสมาธิ ที่จอดรถค่อนข้างจำกัด',
    date: '2569-03-02',
  },
];

const GENDER_OPTIONS = ['ชาย', 'หญิง', 'ไม่ระบุ'];
const DAY_OPTIONS = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];

function getFaithTier(historyCount: number): { title: string;} {
  if (historyCount >= 20) return { title: 'ผู้เชี่ยวชาญสายบุญ' };
  if (historyCount >= 5) return { title: 'ผู้ศรัทธาสม่ำเสมอ' };
  return { title: 'ผู้เริ่มต้นเส้นทางบุญ'};
}

export default function UserProfile() {
  const [user, setUser] = useState<UserData | null>(() => {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.post('/auth/google', {
          accessToken: tokenResponse.access_token,
        });
        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Login Error:', error);
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    },
    onError: () => console.log('Login Failed'),
  });

  const handleLogout = async () => {
    if (!window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) return;
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout Backend Error:', error);
    } finally {
      googleLogout();
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
  };

  const openEdit = () => {
    if (!user) return;
    setEditForm({ ...user });
    setIsEditing(true);
  };

  const closeEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handleFormChange = (field: keyof UserData, value: string) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveProfile = async () => {
    if (!editForm) return;
    setIsSaving(true);
    try {
      const response = await api.put('/user/profile', editForm);
      const updatedUser = response?.data?.user ?? editForm;
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setIsEditing(false);
      setEditForm(null);
    } catch (error) {
      console.error('Update profile error:', error);
      alert('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const faithTier = getFaithTier(MOCK_HISTORY.length);

  return (
    <div className="sms-root">
      {/* Background */}
      <div aria-hidden="true" className="sms-bg-gradient" />

      <div style={{ flex: 1 }}>
        {/* Header Bar */}
        <div className={`sms-header-bar ${user ? 'left' : 'center'}`}>
  <span className="sms-font-header sms-header-title">โปรไฟล์</span>
</div>

        {/* Avatar & Halo */}
        <div className="sms-avatar-container">
          <div className="sms-halo sms-avatar-halo-inner">
            <div className="sms-avatar-bg">
              <div className="sms-avatar-inner">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="sms-avatar-img"
                  />
                ) : (
                  <span className="sms-font-header">{user?.name ? user.name.charAt(0) : 'คน'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Info & Badge */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 className="sms-font-header sms-username">{user ? user.name : 'ผู้มีจิตศรัทธา'}</h2>

          {user ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center', margin: '6px 0' }}>
              <span className="sms-badge-tier">
                {faithTier.title}
              </span>
              {user.birthDayOfWeek && <span className="sms-badge-day">{user.birthDayOfWeek}</span>}
            </div>
          ) : (
            <p style={{ color: 'var(--sms-sub)', fontSize: '13px', margin: '4px 0 16px' }}>
              เข้าสู่ระบบเพื่อบันทึกโปรไฟล์และสะสมบุญบารมี
            </p>
          )}
        </div>

        {/* แสดงเฉพาะตอนเข้าสู่ระบบแล้ว: คติธรรมนำชีวิตประจำวัน */}
        {user && (
          <div className="sms-fortune-banner">
            <div style={{ fontSize: '12px', opacity: 0.85, letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 500 }}>
              คติธรรมนำชีวิตประจำวัน
            </div>
            <p className="sms-font-fortune" style={{ fontSize: '15px', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
              "จิตที่ฝึกดีแล้ว นำสุขมาให้ ความเพียรในวันนี้คือโชคดีในวันหน้า"
            </p>
          </div>
        )}

        {/* ปุ่ม Login กรณีที่ยังไม่ได้เข้าสู่ระบบ */}
        {!user && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => login()} className="sms-login-btn">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
              </svg>
              เข้าสู่ระบบส่องดวงชะตา
            </button>
          </div>
        )}

        {/* แสดงเฉพาะตอนเข้าสู่ระบบแล้ว: Stat Cards */}
        {user && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'เขย่าเซียมซี', value: MOCK_HISTORY.length, unit: 'ครั้ง'},
              { label: 'รีวิวสถานที่มงคล', value: MOCK_REVIEWS.length, unit: 'แห่ง' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="sms-card-hover"
                style={{
                  flex: 1,
                  background: '#FFF',
                  padding: '14px',
                  borderRadius: '16px',
                  border: '1px solid var(--sms-paper-deep)',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
            <div className="sms-font-header" style={{ fontSize: '22px', color: 'var(--sms-maroon)', fontWeight: 600 }}>
                  {stat.value} <span style={{ fontSize: '12px', color: 'var(--sms-sub)', fontWeight: 400 }}>{stat.unit}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--sms-sub)', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs & Content */}
        {user && (
          <>
            <div className="sms-tab-bar">
              {[
                { key: 'info', label: 'ข้อมูลดวง'},
                { key: 'history', label: 'ประวัติเซียมซี'},
                { key: 'reviews', label: 'รีวิววัด'},
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabKey)}
                  className={`sms-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Info */}
            {activeTab === 'info' && (
              <div
                className="sms-rise"
                style={{
                  background: '#FFF',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  border: '1px solid var(--sms-paper-deep)',
                }}
              >
                <InfoRow label="เพศ" value={user.gender || '—'} />
                <InfoRow label="วันเกิดประจำสัปดาห์" value={user.birthDayOfWeek || '—'} />
                <InfoRow label="วันที่เกิด" value={user.birthday || '—'} />
                <InfoRow label="เกี่ยวกับฉัน / ตั้งจิตอธิษฐาน" value={user.bio || '—'} isLast />

                {/* ปุ่มแก้ไขโปรไฟล์ในหน้าข้อมูลดวง */}
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--sms-paper-deep)' }}>
                  <button onClick={openEdit} className="sms-edit-btn">
                    ✏️ แก้ไขโปรไฟล์
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: History */}
            {activeTab === 'history' && (
              <div className="sms-rise" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {MOCK_HISTORY.length === 0 ? (
                  <EmptyState text="ยังไม่มีประวัติการเสี่ยงทายเซียมซี" />
                ) : (
                  MOCK_HISTORY.map((item) => (
                    <div
                      key={item.id}
                      className="sms-card-hover"
                      style={{
                        position: 'relative',
                        background: 'linear-gradient(180deg, #FFFFFF 0%, var(--sms-paper) 100%)',
                        borderRadius: '14px',
                        borderLeft: '4px solid var(--sms-gold)',
                        padding: '16px',
                        textAlign: 'left',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        borderTop: '1px solid var(--sms-paper-deep)',
                        borderRight: '1px solid var(--sms-paper-deep)',
                        borderBottom: '1px solid var(--sms-paper-deep)',
                      }}
                    >
                      <div
                        className="sms-stamp"
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          border: '2px double var(--sms-maroon)',
                          color: 'var(--sms-maroon)',
                          background: 'var(--sms-paper)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: 1,
                        }}
                      >
                        <span style={{ fontSize: '9px', fontWeight: 500 }}>ใบที่</span>
                        <span className="sms-font-header" style={{ fontSize: '16px', fontWeight: 700 }}>
                          {item.stickNumber}
                        </span>
                      </div>

                      <div style={{ paddingRight: '52px', marginBottom: '8px' }}>
                        <div className="sms-font-header" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--sms-maroon-deep)' }}>
                          {'เซียมซีเสี่ยงทาย'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--sms-sub)', marginTop: '2px' }}>
                           {item.date} {item.tag && `• ${item.tag}`}
                        </div>
                      </div>

                      <p
                        className="sms-font-fortune"
                        style={{
                          fontSize: '14px',
                          color: 'var(--sms-ink)',
                          margin: 0,
                          lineHeight: 1.6,
                          background: 'rgba(255,255,255,0.7)',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px dashed var(--sms-paper-deep)',
                        }}
                      >
                        "{item.prediction}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Reviews */}
            {activeTab === 'reviews' && (
              <div className="sms-rise" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MOCK_REVIEWS.length === 0 ? (
                  <EmptyState text="ยังไม่มีประวัติการรีวิววัด" />
                ) : (
                  MOCK_REVIEWS.map((review) => (
                    <div
                      key={review.id}
                      className="sms-card-hover"
                      style={{
                        background: '#FFF',
                        borderRadius: '14px',
                        padding: '16px',
                        textAlign: 'left',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                        border: '1px solid var(--sms-paper-deep)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span className="sms-font-header" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--sms-maroon-deep)' }}>
                          {review.temple}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--sms-sub)' }}>{review.date}</span>
                      </div>
                      <div style={{ marginBottom: '8px', color: 'var(--sms-gold)', fontSize: '14px' }}>
                        {'★'.repeat(review.rating)}
                        <span style={{ color: 'var(--sms-paper-deep)' }}>{'★'.repeat(5 - review.rating)}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--sms-ink)', margin: 0, lineHeight: 1.6 }}>
                        {review.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ย้ายปุ่มออกจากระบบมาไว้ข้างล่างสุด เมื่อล็อกอินแล้ว */}
      {user && (
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button onClick={handleLogout} className="sms-logout-btn">
            ออกจากระบบ
          </button>
        </div>
      )}

      {/* Bottom Sheet Modal สำหรับแก้ไขข้อมูล */}
      {isEditing && editForm && (
        <div className="sms-modal-overlay" onClick={closeEdit}>
          <div className="sms-modal-sheet sms-rise" onClick={(e) => e.stopPropagation()}>
            <div style={{ height: '4px', width: '40px', background: 'var(--sms-paper-deep)', borderRadius: '10px', margin: '0 auto 16px' }} />
            <h3 className="sms-font-header" style={{ color: 'var(--sms-maroon-deep)', margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>
             บันทึกดวงชะตาและข้อมูลส่วนตัว
            </h3>

            <FormField label="ชื่อ-นามสกุล / ชื่อเสริมดวง">
              <input
                type="text"
                className="sms-input"
                value={editForm.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
              />
            </FormField>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <FormField label="เพศ">
                  <select
                    className="sms-input"
                    value={editForm.gender || ''}
                    onChange={(e) => handleFormChange('gender', e.target.value)}
                  >
                    <option value="">เลือกเพศ</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div style={{ flex: 1 }}>
                <FormField label="วันเกิด (สัปดาห์)">
                  <select
                    className="sms-input"
                    value={editForm.birthDayOfWeek || ''}
                    onChange={(e) => handleFormChange('birthDayOfWeek', e.target.value)}
                  >
                    <option value="">เลือกวันเกิด</option>
                    {DAY_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>

            <FormField label="วันที่เกิด">
              <input
                type="date"
                className="sms-input"
                value={editForm.birthday || ''}
                onChange={(e) => handleFormChange('birthday', e.target.value)}
              />
            </FormField>

            <FormField label="ตั้งจิตอธิษฐาน / ความปรารถนา">
              <textarea
                className="sms-input"
                value={editForm.bio || ''}
                onChange={(e) => handleFormChange('bio', e.target.value)}
                rows={3}
                placeholder="ระบุความปรารถนาหรือคำอธิษฐานของคุณ..."
                style={{ resize: 'vertical' }}
              />
            </FormField>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={closeEdit}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--sms-sub)',
                  background: '#FFF',
                  color: 'var(--sms-ink)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--sms-maroon)',
                  color: 'var(--sms-gold-light)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSaving ? 'default' : 'pointer',
                  opacity: isSaving ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(122,28,40,0.2)',
                  fontFamily: 'inherit',
                }}
              >
                {isSaving ? 'กำลังบันทึก...' : 'บันทึกดวงชะตา'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function InfoRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: isLast ? 'none' : '1px solid var(--sms-paper-deep)',
        fontSize: '13px',
      }}
    >
      <span style={{ color: 'var(--sms-sub)' }}>{label}</span>
      <span style={{ color: 'var(--sms-ink)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        background: '#FFF',
        borderRadius: '14px',
        padding: '32px 16px',
        textAlign: 'center',
        color: 'var(--sms-sub)',
        fontSize: '13px',
        border: '1px solid var(--sms-paper-deep)',
      }}
    >
      {text}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', color: 'var(--sms-sub)', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}