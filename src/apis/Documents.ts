import api from "../apis/Client";
import type { ApiEnvelope, DocumentResponse } from "./Types";

// --- 타입 정의 ---


// --- API 호출 함수 ---
export async function fetchDocuments(startDate: string, endDate: string): Promise<DocumentResponse> {
    const res = await api.get<ApiEnvelope<DocumentResponse>>("/documents", {
        params: { startDate, endDate },
    });
    return res.data.data;
}
