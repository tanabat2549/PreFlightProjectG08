import { useEffect } from 'react';
import { api } from '../services/api';

const INTERVAL_MS = 30_000;

// เช็กเซสชันเป็นระยะ และทุกครั้งที่กลับมาที่แท็บ
// ถ้า token ใช้ไม่ได้แล้ว interceptor ใน api.ts จะจัดการเด้งออกให้เอง
export function useSessionGuard() {
  useEffect(() => {
    const check = () => {
      if (document.visibilityState === 'visible' && localStorage.getItem('token')) {
        api.get('/session').catch(() => {});
      }
    };
    const id = setInterval(check, INTERVAL_MS);
    window.addEventListener('focus', check);
    check();
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', check);
    };
  }, []);
}