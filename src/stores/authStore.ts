import { create } from "zustand";
import type { User, Company } from "../apis/Types";
import { getMe } from "../apis/Auth";

/**
 * 백엔드 /me 응답을 느슨하게 수용하기 위한 로컬 타입
 * - id 혹은 userId 둘 중 하나가 올 수 있음
 * - company 가 number(id) 이거나 Company 객체 또는 null 일 수 있음
 */
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
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  login: (u: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>; // ← async 에 맞게 수정
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAuthChecked: false,

  // 로그인 시 실행
  login: (u) => {
    set({
      user: u,
      isAuthenticated: true,
      isAuthChecked: true,
    });
  },

  // 로그아웃 시 실행
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isAuthChecked: true,
    });
  },

  // 인증 상태 복구
  checkAuth: async () => {
    try {
      console.log("사용자 정보 불러오기 실행중...");
      const data = (await getMe()) as MeLike | null;

      if (!data) {
        get().logout();
        return;
      }

      // id 필드 정규화 (id 또는 userId)
      const userId = data.userId ?? data.id;
      if (userId == null) {
        throw new Error("Invalid /me payload: missing user id");
      }

      // company 정규화: 객체일 때만 User.company 에 넣고, 숫자(id)면 추후 필요 시 별도 조회
      let company: Company | null = null;
      if (typeof data.company === "object" && data.company !== null) {
        company = data.company as Company;
      } else {
        company = null;
        // 필요 시: 여기서 company id(data.company 가 number 인 경우)로 상세 조회하여 객체로 매핑하세요.
        // 예) const company = await getCompanyById(data.company as number);
      }

      const user: User = {
        userId,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        company, // Company | null (id만 온 경우는 null로 보관)
      };

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
}));
