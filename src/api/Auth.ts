import api from './Client'
import type { User, LoginResponse } from './Types'
import type { SignupRequest, SignupResponse } from './Types'

export async function signup(payload: SignupRequest) {
    const { data } = await api.post<SignupResponse>('/auth/signup', payload);
    return data;
}

export async function login(payload: User){
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    return data;
}