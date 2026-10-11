import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';


   function clearSession() {
     localStorage.removeItem('token');
     localStorage.removeItem('userData');
   }

let sessionEnded = false;

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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