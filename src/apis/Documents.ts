// API 클라이언트 (응답이 result/message/data 래퍼로 감싸져 있음)

import api from "../apis/Client";

// 공통 래퍼
type ApiEnvelope<T> = {
  result: "SUCCESS" | "FAIL";
  message?: string;
  data: T;
};

export type MeetingDoc = {
  meetingId: number;
  meetingTitle: string;
  minutes: {
    minuteId: number;
    type: string; // "AUTO" | "MANUAL" 등
    contracts: { contractId: number; title: string }[];
  }[];
};

export type StandaloneContract = {
  contractId: number;
  title: string;
  createdAt?: string; // 백엔드에서 없을 수도 있어 optional
};

export type DocumentResponse = {
  // 백엔드가 키를 누락할 수도 있어 optional
  meetingsWithDocs?: { date: string; meetings: MeetingDoc[] }[];
  standaloneContracts?: StandaloneContract[];
};

export async function fetchDocuments(startDate: string, endDate: string) {
  const res = await api.get<ApiEnvelope<DocumentResponse>>("/documents", {
    params: { startDate, endDate },
  });
  // ✅ data 래퍼 해제
  return res.data.data;
}
