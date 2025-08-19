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

// API 페이로드 전체 구조
export interface ContractRequest {
    document: DocumentPayload;
}

// document 객체의 전체 구조
export interface DocumentPayload {
  document_name: string;
  comment: string;
  recipients: Recipient[];
  fields: Field[];
  select_group_name: string;      // 고정값 : "" 
  notification: NotificationRecipient[];
}

// notification 객체의 전체 구조 (알림을 받을 사람)
export interface NotificationRecipient {
  name: string;
  email: string;
  sms: SmsInfo;
  auth: NotificationAuth;
}

// notification 객체에서 알림을 보내는 사람(수신자) 인증 정보
export interface NotificationAuth {
  password: string;
  password_hint: string;
  mobile_verification: boolean;
  valid: AuthValid;
}

// 폼 데이터 형식
export interface Field {
    id: string;
    value: string;
}

// 서명할 수신자의 정보
export interface Recipient {
  step_type: string;  // 고정값 : "01"
  use_mail: boolean;  // 고정값 : true
  use_sms: boolean;   // 고정값 : true
  member: MemberInfo;
  auth: RecipientAuth;
}

// 수신자의 인증 정보
export interface RecipientAuth {
  password: string;       // 예: 휴대폰 번호 뒤 4자리
  password_hint: string;  // 예: "휴대폰번호 뒷자리를 입력해주세요."
  valid: AuthValid;
}

// 수신자의 멤버 정보
export interface MemberInfo {
  name: string;
  id: string; // 이메일 주소
  sms: SmsInfo;
}

// 인증 유효 기간 정보
export interface AuthValid {
  day: number;  // 고정값 : 7
  hour: number; // 고정값 : 0
}

// 국가 코드 및 전화번호 정보
export interface SmsInfo {
  country_code: string; // 예: "+82"
  phone_number: string;
}