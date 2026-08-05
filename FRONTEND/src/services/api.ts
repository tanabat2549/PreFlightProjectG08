import axios from 'axios';

// 🟢 ดึงค่าจาก .env มาเช็กก่อน
const rawUrl = import.meta.env.VITE_API_BASE_URL;

// ถ้า rawUrl ขึ้นต้นด้วย http (เช่น http://localhost:3001/api) ให้ใช้ค่านั้น
// แต่ถ้าเป็นแค่ '/api' หรือค่าว่าง ให้บังคับใช้ 'http://localhost:3001/api'
const baseURL = rawUrl && rawUrl.startsWith('http')
  ? rawUrl
  : 'http://localhost:3001/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor ใส่ Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});