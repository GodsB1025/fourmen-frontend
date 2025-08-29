import { create } from "zustand";
import { persist } from 'zustand/middleware';
import type { User, Company } from "../apis/Types";
import { getMe } from "../apis/Auth";

type MeLike = {
  id?: number;
  userId?: number;
  name: string;
  email: string;
  role: User["role"];
  phone?: string;
  company: number | Company | null;
};

type AuthState = {
  user: User | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  login: (u: User, csrf: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      csrfToken: null,
      isAuthenticated: false,
      isAuthChecked: false,

      login: (u, csrf) => {
        set({
          user: u,
          csrfToken: csrf,
          isAuthenticated: true,
          isAuthChecked: true,
        });
      },

      logout: () => {
        // localStorage에서 auth-storage 아이템을 직접 지워 확실하게 초기화합니다.
        localStorage.removeItem('auth-storage');
        set({
          user: null,
          csrfToken: null,
          isAuthenticated: false,
          isAuthChecked: true,
        });
      },
      
      checkAuth: async () => {
        try {
          // 👇 accessToken 존재 여부를 확인하는 코드를 완전히 삭제합니다.
          // const accessTokenExists = document.cookie.includes('accessToken=');
          // if (!accessTokenExists) {
          //     get().logout();
          //     return;
          // }

          const data = (await getMe()) as MeLike | null;

          if (!data) {
            get().logout();
            return;
          }

          const userId = data.userId ?? data.id;
          if (userId == null) {
            throw new Error("Invalid /me payload: missing user id");
          }

          let company: Company | null = null;
          if (typeof data.company === "object" && data.company !== null) {
            company = data.company as Company;
          }

          const user: User = {
            userId,
            name: data.name,
            email: data.email,
            role: data.role,
            phone: data.phone,
            company,
          };

          // user 정보가 성공적으로 로드되면 isAuthenticated 상태를 true로 설정합니다.
          set({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Auth check failed:", error);
          get().logout();
        } finally {
          set({ isAuthChecked: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, csrfToken: state.csrfToken }),
    }
  )
);