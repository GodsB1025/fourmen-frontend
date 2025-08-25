import api from "../apis/Client";
import type { ApiEnvelope, DocumentResponse, MeetingDoc, MeetingsWithDocsResponse, MinuteDetail, MinuteInfo, SharedMinuteResponse } from "./Types";

// -- 대시보드의 문서 부분에 문서를 조회하기 위한 함수
export async function fetchDocuments(startDate: string, endDate: string): Promise<DocumentResponse> {
    const res = await api.get<ApiEnvelope<DocumentResponse>>("/documents", {
        params: { startDate, endDate },
    });
    return res.data.data;
}

// -- 전자계약에서 회의록이 존재하는 회의 목록을 조회하는 함수
export const fetchMeetingsWithDocs = async (): Promise<MeetingDoc[]> => {
    const data = await api.get<MeetingsWithDocsResponse>("/meetings/with-minutes");
    const rewData = data.data.data;

    const transformedData: MeetingDoc[] = rewData.map((item) => ({
        meetingId: item.meetingId,
        meetingTitle: item.title,
    }));

    return transformedData;
};

// -- 공유받은 회의록 목록을 조회하는 함수 추가
export const fetchSharedMinutes = async (): Promise<SharedMinuteResponse[]> => {
    const { data } = await api.get<ApiEnvelope<SharedMinuteResponse[]>>("/documents/shared/minutes");
    return data.data;
};
