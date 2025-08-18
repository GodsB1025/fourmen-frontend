import api from './Client'
import type { CreateMeetingRequest, CreateMeetingURLRequest, Meeting, MeetingInfoResponse, MeetingListResponse, MeetingURLResponse } from '../apis/Types'

export const createMeetingRoom = async (payload: CreateMeetingRequest) => {
    const { data } = await api.post('/meetings', payload)
    return data
}

// 회의 목록 불러오기
export const getMeetings = async (filter : string): Promise<Meeting[]> => {
    const { data } = await api.get<MeetingListResponse>('/meetings', { params : { filter : filter} });
    if (data.result !== 'SUCCESS') {
        throw new Error(data.message || '내 회의 목록을 불러오는데 실패했습니다.');
    }
    //console.log("넘어오는 데이터 확인:", data)
    return data.data;
}

// 회의방 정보 불러오기
export const getMeetingInfo = async (meetingId: string): Promise<Meeting> => {
    const { data } = await api.post<MeetingInfoResponse>('/meetings/participation', { meetingId })
    if (data.result !== 'SUCCESS') {
        throw new Error(data.message || '내 회의 정보를 불러오는데 실패했습니다.');
    }
    // console.log("회의방 정보 확인:", data)
    return data.data
}

// 회의방 URL 생성
export const createMeetingURL = async (meetingId: string, payload: CreateMeetingURLRequest): Promise<MeetingURLResponse> => {
    const { data } = await api.post(`/meetings/${meetingId}/video-room`, { 
        params: { meetingId },
        body: { payload }
    })
    // console.log("URL 생성하기 데이터 확인:", data)
    return data.data
}

// 회의방 URL 생성
export const getMeetingURL = async (meetingId: string): Promise<MeetingURLResponse> => {
    const { data } = await api.post(`/meetings/${meetingId}/enter-video`, { 
        params: { meetingId }
    })
    // console.log("URL 불러오기 데이터 확인:", data)
    return data.data
}

// 회의방 비활성화
export const disableMeetingRoom = async (meetingId: string) => {
    await api.post(`/meetings/${meetingId}/end`, { params: {meetingId} })
}