// ------------------------------------

// --- 나머지 기존 타입 정의 ... ---
export interface CreateMeetingRequest {
    title: string;
    scheduledAt: string;
    useAiMinutes: boolean;
    participantEmails: string[];
}

export interface CreateMeetingURLRequest {
    description: string;
    password: string;
    manuallyApproval: boolean;
    canAutoRoomCompositeRecording: boolean;
    scheduledAt: string;
}

export interface MeetingListResponse {
    result: "SUCCESS" | "ERROR";
    message: string;
    data: Meeting[];
}
export interface MeetingInfoResponse {
    result: "SUCCESS" | "ERROR";
    message: string;
    data: Meeting;
}

export interface MeetingURLResponse {
    videoMeetingUrl: string;
    embedUrl: string;
}

export interface Company {
    id: number;
    name?: string;
}

export type UserRole = "USER" | "ADMIN";

export interface SignupRequest {
    email: string;
    password: string;
    name: string;
    phone: string;
    adminCode: string;
}
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
    role: "USER" | "ADMIN" | "CONTRACT_ADMIN";
    company: Company | null;
    phone?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    result: "SUCCESS" | "ERROR";
    message: string;
    data: User;
}

export interface GetMeResponse {
    id: number;
    name: string;
    email: string;
    role: "USER" | "ADMIN" | "CONTRACT_ADMIN";
    company: number | null;
    phone: string;
}

// 전자계약
export interface Contract {
    templateId: number;
    templateName: string;
    eformsignTemplateId: string;
    previewImageUrl: string;
    dataSchema: unknown;
}

export interface ContractRequest {
    document: DocumentPayload;
}

export interface DocumentPayload {
    document_name: string;
    comment: string;
    recipients: Recipient[];
    fields: Field[];
    select_group_name: string;
    notification: NotificationRecipient[];
}

export interface NotificationRecipient {
    name: string;
    email: string;
    sms: SmsInfo;
    auth: NotificationAuth;
}

export interface NotificationAuth {
    password: string;
    password_hint: string;
    mobile_verification: boolean;
    valid: AuthValid;
}

export interface Field {
    id: string;
    value: string;
}

export interface Recipient {
    step_type: string;
    use_mail: boolean;
    use_sms: boolean;
    member: MemberInfo;
    auth: RecipientAuth;
}

export interface RecipientAuth {
    password: string;
    password_hint: string;
    valid: AuthValid;
}

export interface MemberInfo {
    name: string;
    id: string;
    sms: SmsInfo;
}

export interface AuthValid {
    day: number;
    hour: number;
}

export interface SmsInfo {
    country_code: string;
    phone_number: string;
}

export interface TodayEvent {
    eventId: number;
    title: string;
    startTime: string;
    endTime: string | null;
    eventType: "MEETING" | "PERSONAL";
}

export interface CompletedContract {
    contractId: number;
    title: string;
    completedAt: string;
    fileUrlBase: string;
}

// -----------------------------

export type MemberRole = "ADMIN" | "USER" | "CONTRACT_ADMIN";
export type MemberStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export interface CompanyMember {
    id: number;
    name: string;
    email: string;
    role: MemberRole;
    status?: MemberStatus;
    joinedAt?: string;
}

export interface InviteMemberRequest {
    email: string;
    role: MemberRole;
}

// --------------------------------

// 회의록
// 회의 목록 조회 시 각 회의의 정보를 담을 타입
export interface Meeting {
    meetingId: number;
    title: string;
    scheduledAt: string;
    hostName: string;
    hostId: number; // 주최자 ID
    useAiMinutes: boolean;
    participantsCount: number;
    roomId?: number | null;
}

// --- 수동 회의록 관련 타입 추가 ---
export interface ManualMinuteRequest {
    content: string;
}

export interface ManualMinuteResponse {
    minuteId: number;
    authorName: string;
    createdAt: string;
    content: string;
}

export type ApiEnvelope<T> = {
    result: "SUCCESS" | "FAIL";
    message?: string;
    data: T;
};

export interface ContractInfo {
    contractId: number;
    title: string;
    completedPdfUrl: string; // PDF URL 포함
}

// 회의에 속한 회의록 정보 (목록 조회용)
export interface MinuteInfo {
    minuteId: number;
    type: "AUTO" | "SELF" | "SUMMARY";
    contracts: ContractInfo[];
}

export interface MeetingDoc {
    meetingId: number;
    meetingTitle: string;
    minutes: MinuteInfo[];
}

export interface StandaloneContract {
    contractId: number;
    title: string;
    createdAt?: string;
    completedPdfUrl: string; // PDF URL 포함
}

export interface DocumentResponse {
    meetingsWithDocs?: { date: string; meetings: MeetingDoc[] }[];
    standaloneContracts?: StandaloneContract[];
}

// 회의록 상세 보기 응답 타입
export interface MinuteDetail {
    minuteId: number;
    meetingTitle: string;
    type: "AUTO" | "SELF" | "SUMMARY";
    authorName: string;
    createdAt: string;
    content: string;
}