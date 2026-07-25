import { api } from '../services/api';
import type { Fortune } from '../types/fortune';
import axios from 'axios';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// เขย่าเซียมซี (สุ่ม)
export async function drawFortune(): Promise<Fortune> {
  try {
    const response = await api.get<APIResponse<Fortune>>('/api/siemsee/draw');
    const { success, data, message } = response.data;

    if (!success || !data) {
      throw new Error(message || 'ไม่สามารถเขย่าเซียมซีได้');
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

// ดึงตามหมายเลข
export async function getFortuneByNumber(num: number): Promise<Fortune> {
  try {
    const response = await api.get<APIResponse<Fortune>>(`/api/siemsee/${num}`);
    const { success, data, message } = response.data;

    if (!success || !data) {
      throw new Error(message || 'ไม่พบข้อมูลใบเซียมซี');
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}