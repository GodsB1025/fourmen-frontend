// 회원가입 api 연동 타입 정의
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  adminCode: string; 
}

export interface CreateMeetingRequest {
  title : string,
  scheduleAt: string,
  useAiMinutes: boolean,
  participantEmails: string[],
}

export interface Company {
  id: number;
  name: string;
}

export type UserRole = 'USER' | 'ADMIN';

export interface SignupResponse {
  userId: number;
  email: string;
  name: string;
  company: Company;
  role: UserRole;
}

export interface User {
  userId: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'CONTRACT_ADMIN';
  company: number | null;
}

// 로그인 api 연동을 위한 타입 정의
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data: User;
}

export interface GetMeResponse {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'CONTRACT_ADMIN';
  company: number | null;
  phone: string;
}

