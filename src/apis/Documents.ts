import api from "../apis/Client";

// --- 타입 정의 ---
type ApiEnvelope<T> = {
    result: "SUCCESS" | "FAIL";
    message?: string;
    data: T;
};

export interface ContractInfo {
    contractId: number;
    title: string;
    completedPdfUrl: string; // PDF URL 포함
}

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

// --- API 호출 함수 ---
export async function fetchDocuments(startDate: string, endDate: string): Promise<DocumentResponse> {
    const res = await api.get<ApiEnvelope<DocumentResponse>>("/documents", {
        params: { startDate, endDate },
    });
    return res.data.data;
}
