
/** 회원가입 절차 단계 */
export type Step = 0 | 1 | 2 | 3 | 4 | 5;

/** 가입 유형 (일반 사용자 또는 관리자) */
export type UserType = "USER" | "ADMIN" | null;

/** 회원가입 폼 전체 상태 */
export type Form = {
    type: UserType;
    email: string;
    code: string;
    name: string;
    pw: string;
    pw2: string;
    adminKey: string;
    phone: string;
};