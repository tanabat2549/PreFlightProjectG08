import axios from 'axios';

// key ที่แอปหลักใช้เก็บ JWT (ยืนยันจาก services/api.ts)
const TOKEN_KEY = 'token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// ใช้ URL เดียวกับแอปหลัก
const root = import.meta.env.VITE_API_BASE_URL || '/api';

export const adminApi = axios.create({ baseURL: `${root}/admin` });

adminApi.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const ROLES = ['user', 'superadmin'] as const; // ตรงกับ roleEnum ใน schema.ts

export type Actor = { id: number; email?: string; name?: string; role: string };

export type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  picture: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export type AuditLog = {
  id: number;
  action: string;
  targetType: string | null;
  targetId: number | null;
  details: unknown;
  ip: string | null;
  createdAt: string;
  actorId: number | null;
  actorName: string | null;
  actorEmail: string | null;
};

export type DayCount = { day: string; count: number };

export type Stats = {
  users: { total: number; active: number; locked: number; newLast7Days: number };
  usersByRole: { role: string; count: number }[];
  totals: { temples: number; reviews: number; fortunes: number; auspiciousDays: number; siemseeDraws: number };
  siemseeDrawsPerDay: DayCount[];
  signupsPerDay: DayCount[];
  topTemples: { id: number; name: string; ratingAvg: number | string | null; ratingCount: number }[];
};

export function errMsg(e: unknown): string {
  if (axios.isAxiosError(e)) {
    return e.response?.data?.message ?? (e.response ? `เกิดข้อผิดพลาด (${e.response.status})` : 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
  }
  return e instanceof Error ? e.message : 'เกิดข้อผิดพลาด';
}

// รองรับทั้ง [..] และ { data: [..] }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unwrapList<T>(body: any): T[] {
  return Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
}
