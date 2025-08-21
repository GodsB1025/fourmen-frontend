import api from "./Client";
import type {
    CreateMeetingRequest,
    CreateMeetingURLRequest,
    Meeting,
    MeetingInfoResponse,
    MeetingListResponse,
    MeetingURLResponse,
    ManualMinuteRequest,
    ManualMinuteResponse,
    MinuteInfo,
} from "../apis/Types";

export const createMeetingRoom = async (payload: CreateMeetingRequest) => {
    const { data } = await api.post("/meetings", payload);
    return data;
};

export const getMeetings = async (filter: string): Promise<Meeting[]> => {
    const { data } = await api.get<MeetingListResponse>("/meetings", { params: { filter: filter } });
    if (data.result !== "SUCCESS") {
        throw new Error(data.message || "내 회의 목록을 불러오는데 실패했습니다.");
    }
    return data.data;
};

export const getMeetingInfo = async (meetingId: string): Promise<Meeting> => {
    const { data } = await api.post<MeetingInfoResponse>(`/meetings/participation`, { meetingId });
    if (data.result !== "SUCCESS") {
        throw new Error(data.message || "회의 정보를 불러오는데 실패했습니다.");
    }
    return data.data;
};

export const createMeetingURL = async (meetingId: string, payload: CreateMeetingURLRequest): Promise<MeetingURLResponse> => {
    const { data } = await api.post(`/meetings/${meetingId}/video-room`, payload);
    return data.data;
};

export const getMeetingURL = async (meetingId: string): Promise<MeetingURLResponse> => {
    const { data } = await api.post(`/meetings/${meetingId}/enter-video`);
    return data.data;
};

export const disableMeetingRoom = async (meetingId: string) => {
    await api.post(`/meetings/${meetingId}/end`);
};

// --- 수동 회의록 관련 API 함수들 ---

// 1. 회의록 목록 조회 (ID와 타입만 반환)
export const getMinutesForMeeting = async (meetingId: string): Promise<MinuteInfo[]> => {
    const { data } = await api.get(`/meetings/${meetingId}/minutes-for-contract`);
    return data.data;
};

// 2. 특정 회의록 상세 정보 조회 (내용 포함)
export const getMinuteDetails = async (meetingId: string, minuteId: number): Promise<ManualMinuteResponse> => {
    const { data } = await api.get(`/meetings/${meetingId}/minutes/${minuteId}`);
    return data.data;
};

// 3. 새 수동 회의록 생성
export const submitManualMinute = async (meetingId: string, content: string): Promise<ManualMinuteResponse> => {
    const payload: ManualMinuteRequest = { content };
    const { data } = await api.post(`/meetings/${meetingId}/minutes`, payload);
    return data.data;
};

// 4. 기존 수동 회의록 수정
export const updateManualMinute = async (meetingId: string, minuteId: number, content: string): Promise<ManualMinuteResponse> => {
    const payload: ManualMinuteRequest = { content };
    const { data } = await api.patch(`/meetings/${meetingId}/minutes/${minuteId}`, payload);
    return data.data;
};
