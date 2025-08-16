import api from './Client'
import type { CreateMeetingRequest } from '../apis/Types'

export const createMeetingRoom = async (payload: CreateMeetingRequest) => {
    const { data } = await api.post('/meetings', payload)
    return data
}