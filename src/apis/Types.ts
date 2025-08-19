// 회원가입 api 연동 타입 정의
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  adminCode: string; 
}

// 회의 목록 조회 시 각 회의의 정보를 담을 타입
export interface Meeting {
  meetingId: number;
  title: string;
  scheduledAt: string; // ISO 8601 형식의 날짜 문자열 (예: "2025-08-16T10:00:00Z")
  hostName: string;
  useAIMinutes: boolean;
  participantsCount: number;
}

export interface CreateMeetingRequest {
  title : string,
  scheduledAt: string,
  useAiMinutes: boolean,
  participantEmails: string[],
}

export interface CreateMeetingURLRequest {
  "description": string,
  "password": string,
  "manuallyApproval": boolean,
  "canAutoRoomCompositeRecording": boolean,
  "scheduledAt": string
}

// 회의 목록 API 응답 타입 (서버 응답 구조에 따라 조정 필요)
export interface MeetingListResponse {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data: Meeting[];
}
export interface MeetingInfoResponse {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data: Meeting;
}

export interface MeetingURLResponse {
  videoMeetingUrl: string;
  embedUrl: string;
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

export interface Contract {
  templateId: number,
  templateName: string,
  eformsignTemplateId: string,
  previewImageUrl: string,
  dataSchema: unknown,
}