import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import type { ApiError } from '../types/error';
import Cookies from 'js-cookie';

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 5000,
});

let isRefreshing = false;
let pendingQueue: Array<(ok: boolean) => void> = [];
const enqueue = (cb: (ok: boolean) => void) => pendingQueue.push(cb);
const flushQueue = (ok: boolean) => { pendingQueue.forEach(cb => cb(ok)); pendingQueue = []; };

// --- ✨ CSRF 초기화 (서버에 맞게 한 번 호출해서 쿠키 세팅) ---
export async function initCsrf() {
  try {
    // 서버 구현에 맞춰 경로 선택: 우선순위대로 시도
    await api.get('/auth/csrf');
  } catch {
    try { await api.get('/csrf'); } catch { /* noop */ }
  }
}

// 요청 인터셉터
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const method = (config.method || 'get').toLowerCase();
    const hasBody = ['post', 'put', 'patch', 'delete'].includes(method);
    config.headers = config.headers ?? {};
    if (hasBody && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    if (!config.headers['Accept']) {
      config.headers['Accept'] = 'application/json';
    }

    // 쿠키에서 XSRF-TOKEN 값을 읽어와 헤더로 전달
    const csrfToken = Cookies.get('XSRF-TOKEN');
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

    if (!error.response) {
      return Promise.reject(new Error('네트워크 오류 또는 서버에 연결할 수 없습니다.'));
    }

    const urlPath = (original?.url || '').toLowerCase();
    const isRefreshCall = urlPath.includes('/auth/refresh');

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          enqueue((ok) => (ok ? resolve(api(original)) : reject(error)));
        });
      }

      isRefreshing = true;
      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        flushQueue(true);
        return api(original);
      } catch (refreshErr) {
        isRefreshing = false;
        flushQueue(false);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      }
    }

    if (status === 403) {
      return Promise.reject(error);
    }

    const data = error.response.data as ApiError;
    let serverMsg: string | undefined;
    if (data) {
      if (typeof data === 'string') serverMsg = data;
      else if (typeof (data as any).message === 'string') serverMsg = (data as any).message;
      else if (typeof (data as any).error === 'string') serverMsg = (data as any).error;
    }
    return Promise.reject(new Error(serverMsg || `요청 실패 (${status})`));
  }
);

export default api;
