import api from '../Client'
import type { User, LoginResponse } from '../Types'

export async function login(payload: User){
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
}