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
        console.log("상태 복구 api getMe 객체 확인:", data)
        const user : User = {
          userId : data.id,
          name : data.name,
          email : data.email,
          role : data.role,
          company : data.company
        }
        console.log("상태 복구 후 새로 생성한 User user 객체 확인:", user)
        set({
          user,
          isAuthenticated: true
        })
        console.log("상태 복구 후 전역 user 객체 확인:", get().user)
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