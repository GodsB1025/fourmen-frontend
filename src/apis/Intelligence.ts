import api from "./Client";

// API 요청 본문 타입
export interface IntelligenceSearchRequest {
    query: string;
}

// API 응답 데이터 타입
export interface IntelligenceSearchResponse {
    answer: string;
}

/**
 * AI 비서에게 회의록에 대한 질문을 전송합니다.
 * @param query - 사용자의 질문 (자연어)
 * @returns AI의 답변 문자열
 */
export const searchIntelligence = async (query: string): Promise<string> => {
    const requestBody: IntelligenceSearchRequest = { query };
    const { data } = await api.post("/intelligence/search", requestBody);
    // 서버 응답 구조에 따라 실제 답변 데이터 경로를 정확히 지정합니다.
    return data.data.answer;
};
