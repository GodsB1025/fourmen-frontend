import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auths';

// const baseURL = import.meta.env.DEV
//   ? '/api'
//   : (import.meta.env.VITE_API_BASE_URL as string)
const baseURL = import.meta.env.VITE_API_BASE_URL as string

const api = axios.create({
    baseURL,
  withCredentials: true,              
  timeout: 5000,
})

// export async function initCsrf() {
//   try {
//     // 서버 구현에 맞게 경로 확인 (예: '/csrf' or '/auth/csrf')
//     await api.get('/csrf');
//   } catch {
//     // noop (로그만 필요하면 추가)
//   }
// }

let isRefreshing = false;
let pendingQueue: Array<(ok: boolean) => void> = [];
const enqueue = (cb: (ok: boolean) => void) => pendingQueue.push(cb);
const flushQueue = (ok: boolean) => { pendingQueue.forEach(cb => cb(ok)); pendingQueue = []; };

// 요청 인터셉터
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 바디가 있는 메서드에만 Content-Type 기본값 설정
    console.log("요청 URL 확인:",baseURL)
    const method = (config.method || 'get').toLowerCase();
    const hasBody = ['post', 'put', 'patch', 'delete'].includes(method);
    config.headers = config.headers ?? {};
    if (hasBody && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    // 권장: 수락 헤더 기본값
    if (!config.headers['Accept']) {
      config.headers['Accept'] = 'application/json';
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    // 네트워크/타임아웃/브라우저 차단 (response 없음)
    if (!error.response) {
      return Promise.reject(new Error('네트워크 오류 또는 서버에 연결할 수 없습니다.'));
    }


    const urlPath = (original?.url || '').toLowerCase();
    const isRefreshCall = urlPath.includes('/auth/refresh');

    // 403: CSRF 실패 가능 → unsafe 메서드에서만 1회 /csrf 후 재시도
    // if (status === 403 && original && !original._retry && isUnsafe) {
    //   original._retry = true;
    //   try {
    //     await initCsrf();
    //     return api(original);
    //   } catch {
    //     return Promise.reject(error);
    //   }
    // }

    // 401: 액세스 토큰 만료 → refresh (단, refresh 요청 자신은 재시도 금지)
    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          enqueue((ok) => (ok ? resolve(api(original)) : reject(error)));
        });
      }

      isRefreshing = true;
      try {
        await api.post('/auth/refresh');   // 서버 경로/메서드 확인
        isRefreshing = false;
        flushQueue(true);
        return api(original);
      } catch (refreshErr) {
        isRefreshing = false;
        flushQueue(false);
        // 여기서 전역 로그아웃/리디렉션 가능
        // window.location.href = '/signin';
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      }
    }

    if (status === 403) {
      return Promise.reject(error);
    }

    // 그 외 에러는 그대로 전달(서버 메시지 노출 보정)
    const data = error.response.data as any;
    let serverMsg: string | undefined;
    if (data) {
      if (typeof data === 'string') serverMsg = data;
      else if (typeof data.message === 'string') serverMsg = data.message;
      else if (typeof data.error === 'string') serverMsg = data.error;
    }
    return Promise.reject(new Error(serverMsg || `요청 실패 (${status})`));
  }
);

export default api;
