import axios from "axios";
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/authStore";

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

const api = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 5000,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
});

function getCookie(name: string) {
    if (typeof document === "undefined") return "";
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : "";
}

export async function initCsrf() {
    const has = getCookie("XSRF-TOKEN") || getCookie("CSRF-TOKEN") || getCookie("csrf_token");
    if (has) return;
}

/* 요청 인터셉터 */
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const method = (config.method || "get").toLowerCase();
        const hasBody = ["post", "put", "patch", "delete"].includes(method);
        config.headers = config.headers ?? {};
        if (hasBody && !config.headers["Content-Type"]) {
            config.headers["Content-Type"] = "application/json";
        }
        if (!config.headers["Accept"]) config.headers["Accept"] = "application/json";

        const csrf = useAuthStore.getState().csrfToken;
        if (csrf) {
            (config.headers as any)["X-XSRF-TOKEN"] = csrf;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

/* 401/403 처리 */
let isRefreshing = false;
let queue: Array<(ok: boolean) => void> = [];
const enqueue = (cb: (ok: boolean) => void) => queue.push(cb);
const flush = (ok: boolean) => {
    queue.forEach((f) => f(ok));
    queue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        if (!error.response) return Promise.reject(new Error("네트워크 오류 또는 서버에 연결할 수 없습니다."));
        const status = error.response.status;
        const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
        const urlPath = (original?.url || "").toLowerCase();
        const method = (original?.method || "get").toLowerCase();
        const isUnsafe = ["post", "put", "patch", "delete"].includes(method);
        const isRefreshCall = urlPath.includes("/auth/refresh");

        if (status === 401 && original && !original._retry && !isRefreshCall) {
            original._retry = true;
            if (isRefreshing) {
                return new Promise((resolve, reject) => enqueue((ok) => (ok ? resolve(api(original)) : reject(error))));
            }
            isRefreshing = true;
            try {
                await api.post("/auth/refresh");
                isRefreshing = false;
                flush(true);
                return api(original);
            } catch (e) {
                isRefreshing = false;
                flush(false);
                useAuthStore.getState().logout();
                return Promise.reject(e);
            }
        }

        if (status === 403 && original && !original._retry && isUnsafe && !isRefreshCall) {
            original._retry = true;
            try {
                await initCsrf();
                return api(original);
            } catch {}
        }

        if (status === 403) return Promise.reject(error);

        const data = error.response.data as any;
        const msg =
            typeof data === "string"
                ? data
                : typeof data?.message === "string"
                ? data.message
                : typeof data?.error === "string"
                ? data.error
                : `요청 실패 (${status})`;
        return Promise.reject(new Error(msg));
    }
);

export default api;
