import { api } from '../services/api';
import type { Fortune } from '../types/fortune';
import { mockFortunes } from '../data/mockFortunes';
import axios from 'axios';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// 🔧 สลับ true/false เพื่อใช้ mock data แทนของจริงตอนทำ UI
// พร้อม integrate จริงเมื่อไหร่ ค่อยเปลี่ยนเป็น false
const USE_MOCK = false;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// เขย่าเซียมซี (สุ่ม) — ยังไม่บันทึกลงประวัติ ต้องกด "เก็บใบเซียมซี" ก่อน
export async function drawFortune(): Promise<Fortune> {
  if (USE_MOCK) {
    await wait(400); // delay for ux
    const randomIndex = Math.floor(Math.random() * mockFortunes.length);
    return mockFortunes[randomIndex];
  }

  try {
    const response = await api.get<APIResponse<Fortune>>('/siemsee/draw');
    const { success, data, message } = response.data;

    if (!success || !data) {
      throw new Error(message || 'ไม่สามารถเขย่าเซียมซีได้');
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message, { cause: error });
    }
    throw error;
  }
}

// เก็บใบเซียมซีลงประวัติ (ต้องล็อกอิน)
export async function saveFortune(fortuneId: number): Promise<void> {
  if (USE_MOCK) {
    await wait(300);
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) throw new Error('กรุณาเข้าสู่ระบบก่อนเก็บใบเซียมซี');

  try {
    const response = await api.post<APIResponse<null>>(
      '/siemsee/save',
      { fortuneId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'เก็บใบเซียมซีไม่สำเร็จ');
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message, { cause: error });
    }
    throw error;
  }
}

// ดึงตามหมายเลข
export async function getFortuneByNumber(num: number): Promise<Fortune> {
  if (USE_MOCK) {
    await wait(300);
    const found = mockFortunes.find((f) => f.number === num);
    if (!found) throw new Error('ไม่พบข้อมูลใบเซียมซี');
    return found;
  }

  try {
    const response = await api.get<APIResponse<Fortune>>(`/siemsee/${num}`);
    const { success, data, message } = response.data;

    if (!success || !data) {
      throw new Error(message || 'ไม่พบข้อมูลใบเซียมซี');
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message, { cause: error });
    }
    throw error;
  }
}