import api from './Client'
import type { User, LoginRequest, LoginResponse, GetMeResponse } from './Types'
import type { SignupRequest, SignupResponse } from './Types'

export async function signup(payload: SignupRequest) {
    const { data } = await api.post<SignupResponse>('/auth/signup', payload);
    return data;
}

// 인증 코드 전송
export async function sendVerificationEmail(email: string) {
  // 2xx면 성공으로 간주. 서버가 메시지를 반환하면 data를 받아서 사용해도 됨.
  await api.post('/auth/email/send', null, { params: { email } });
}

// 인증 코드 검증
export async function verifyEmailCode(email: string, code: string) {
  await api.post('/auth/email/verify', {
  email: email.trim(),
  authCode: code.trim(), 
}, {
  headers: { 'Content-Type': 'application/json' }
});
}

export async function login(payload: LoginRequest):Promise<User>{
    const { data } = await api.post<LoginResponse>('/auth/login', payload)
    if(data.result !== 'SUCCESS'){
      throw new Error(data.message || '로그인 실패')
    }
    return data.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function getMe(): Promise<GetMeResponse> {
  const { data } = await api.get('/user/me');
  // console.log("user/me 의 결과:", data)
  return data;
}