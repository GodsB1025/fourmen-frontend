import { create } from 'zustand';
import type { User } from '../apis/Types';
import { getMe } from '../apis/Auth';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  login: (u: User ) => void;
  logout: () => void;
  checkAuth: () => void;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAuthChecked: false,

  //로그인 시 실행
  login: (u) => {
    set({
      user: u,
      isAuthenticated: true,
      isAuthChecked: true
    })
  },

  //로그아웃 시 실행
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isAuthChecked: true
    })
  },

  //인증 상태 복구
  checkAuth: async () => {
    try {
      // 브라우저에 유효한 HttpOnly 쿠키가 있다면 성공적으로 사용자 정보를 받아옴
      console.log("사용자 정보 불러오기 실행중...")
      const data = await getMe();
      if(data) {
        const user : User = {
          userId : data.id,
          name : data.name,
          email : data.email,
          role : data.role,
          company : data.company
        }
        set({
          user,
          isAuthenticated: true
        })
      } else {
        get().logout()
      }
    } catch (error) {
      console.error("Auth check failed:", error); 
      get().logout()
    } finally {
      set({ isAuthChecked: true })
    }
  }
}));