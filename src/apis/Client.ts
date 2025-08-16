import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import type { ApiError } from '../types/error';
import Cookies from 'js-cookie';


// const baseURL = import.meta.env.DEV
//   ? '/api'
//   : (import.meta.env.VITE_API_BASE_URL as string)
const baseURL = import.meta.env.VITE_API_BASE_URL as string

const api = axios.create({
    baseURL,
  withCredentials: true,              
  timeout: 5000,
})

let isRefreshing = false;
let pendingQueue: Array<(ok: boolean) => void> = [];
const enqueue = (cb: (ok: boolean) => void) => pendingQueue.push(cb);
const flushQueue = (ok: boolean) => { pendingQueue.forEach(cb => cb(ok)); pendingQueue = []; };

// 요청 인터셉터
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // console.log("요청 URL 확인:",baseURL)
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

    // 쿠키에서 XSRF-TOKEN 값을 읽어오고, 있으면 헤더에 추가
    const csrfToken = Cookies.get('XSRF-TOKEN');
    console.log("csrfToken 확인:",csrfToken)
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
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
        console.log("refresh토큰 만료, 재발급 시도")
        await api.post('/auth/refresh');   // 서버 경로/메서드 확인
        isRefreshing = false;
        flushQueue(true);
        console.log("refresh토큰 재발급 성공")
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
    const data = error.response.data as ApiError;
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
