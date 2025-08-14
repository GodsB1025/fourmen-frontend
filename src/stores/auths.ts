import { create } from 'zustand';
import type { User } from '../api/Types';

type AuthState = {
  user: User | null;
  isAuthChecked: boolean;
  isAuthenticated: () => boolean;
  setUser: (u: User | null) => void;
  setAuthChecked: (isChecked: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthChecked: false,
  isAuthenticated: () => !!get().user,
  setUser: (u) => set({ user: u }),
  setAuthChecked: (isChecked) => set({ isAuthChecked: isChecked }),
  logout: () => set({ user: null, isAuthChecked: true }),
}));