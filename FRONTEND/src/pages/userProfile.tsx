import { useState } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { api } from '../services/api';

interface UserData {
  name: string;
  email: string;
  picture?: string;
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

  // 🟢 ใช้ useGoogleLogin สร้างฟังก์ชันสำหรับปุ่ม Custom
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // ส่ง access_token ไปให้ Backend
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
    const confirmLogout = window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?');
    if (!confirmLogout) return;

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

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {/* 1. รูปโปรไฟล์ */}
      <div style={{ 
        width: '80px', 
        height: '80px', 
        borderRadius: '50%', 
        background: '#EAE5D9', 
        margin: '0 auto 12px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '36px',
        overflow: 'hidden'
      }}>
        {user?.picture ? (
          <img
           src={user.picture} 
           alt={user.name} 
           referrerPolicy="no-referrer" 
           style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
           onError={(e) => {
           // หากรูปโหลดไม่สำเร็จ ให้ซ่อนแท็ก img เพื่อถอยไปใช้แบบสำรอง
           (e.target as HTMLImageElement).style.display = 'none';
           }} 
          />
        ): null}
    
      {/* แสดงตัวอักษรแรกของชื่อ หรือ อิโมจิสำรอง หากไม่มีรูป / รูปโหลดไม่ขึ้น */}
      {(!user?.picture) && (
        <span>{user?.name ? user.name.charAt(0) : '👤'}</span>
      )}
    </div>

      {/* 2. ชื่อผู้ใช้งาน และ อีเมล */}
      <h2 style={{ color: 'var(--primary-red)', margin: '0 0 4px' }}>
        {user ? user.name : 'ผู้ใช้งานทั่วไป'}
      </h2>
      <p style={{ color: 'var(--text-sub)', fontSize: '13px', margin: '0 0 16px' }}>
        {user ? user.email : 'เข้าสู่ระบบเพื่อบันทึกประวัติการทำบุญ'}
      </p>

      {/* 3. ปุ่ม Google Login แบบ Custom / ปุ่มออกจากระบบ */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        {!user ? (
          /* 🟢 ปุ่ม Custom Google Login ดีไซน์ตามภาพมาตรฐาน */
          <button
            onClick={() => login()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #DADCE0',
              background: '#FFFFFF',
              color: '#3C4043',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            ลงชื่อเข้าใช้ด้วย Google
          </button>
        ) : (
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: '1px solid var(--primary-red)',
              background: 'transparent',
              color: 'var(--primary-red)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            ออกจากระบบ
          </button>
        )}
      </div>

      {/* 4. การ์ดแสดงสถิติ */}
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