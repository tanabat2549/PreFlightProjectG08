import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

// ล้างสถานะล็อกอินทั้งหมด: token + ข้อมูลผู้ใช้ที่แอปเก็บไว้ (ไม่รู้ชื่อ key ก็ลบได้)
function clearSession() {
  localStorage.removeItem('token');
  for (const store of [localStorage, sessionStorage]) {
    for (const key of Object.keys(store)) {
      try {
        const v = JSON.parse(store.getItem(key) ?? 'null');
        if (v && typeof v === 'object' && ('email' in v || 'picture' in v)) store.removeItem(key);
      } catch {
        /* ไม่ใช่ JSON ข้ามไป */
      }
    }
  }
}


let sessionEnded = false;
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor ใส่ Token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const code = err.response?.data?.code;
    const url: string = err.config?.url ?? '';

    const sessionDead = status === 401 || (status === 403 && code === 'ACCOUNT_LOCKED');
    const hadToken = !!localStorage.getItem('token');

    if (hadToken && sessionDead && !url.includes('/auth/') && !sessionEnded) {
      sessionEnded = true;
      clearSession();
      alert(
        status === 403
          ? (err.response?.data?.message ?? 'บัญชีนี้ถูกระงับการใช้งาน')
          : 'บัญชีของคุณถูกลบหรือเซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
      );
      window.location.replace('/profile'); // โหลดหน้าโปรไฟล์ใหม่ในสถานะยังไม่ล็อกอิน (รูปที่ 2)
    }
    return Promise.reject(err);
  }
);