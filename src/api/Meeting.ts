import api from './Client'
import type { CreateMeetingRequest } from './Types'

export const createMeetingRoom = async (payload: CreateMeetingRequest) => {
    const { data } = await api.post('/meeting', payload)
    return data
}