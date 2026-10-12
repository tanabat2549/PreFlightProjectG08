import { createContext, useContext } from 'react';
import type { Actor } from './adminApi';

export const AdminContext = createContext<Actor | null>(null);

export function useAdmin(): Actor {
  const v = useContext(AdminContext);
  if (!v) throw new Error('useAdmin ต้องใช้ภายใต้ AdminGuard');
  return v;
}
