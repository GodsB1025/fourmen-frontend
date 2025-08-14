import api from './Client'
import type { User, LoginResponse } from './Types'
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

export async function login(payload: User){
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    return data;
}