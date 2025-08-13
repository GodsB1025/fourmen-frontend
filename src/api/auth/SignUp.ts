import api from '../Client';
import type {SignupRequest, SignupResponse} from '../Types'

export async function signup(payload: SignupRequest) {
  // initCsrf()를 앱 시작 시 이미 불렀다면 바로 POST 가능
  const { data } = await api.post<SignupResponse>('/auth/signup', payload);
  return data;
}