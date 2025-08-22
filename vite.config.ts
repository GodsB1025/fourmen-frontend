import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    define: {
        global: "window",
    },
    server: {
        port: 5173, // 프론트 포트
        proxy: {
            "/api": {
                target: "http://localhost:8081",
                changeOrigin: true,
                ws: true,
                secure: false,
                // ⬇️ 만약 백엔드가 /api 프리픽스를 쓰지 않는다면 주석 해제
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
});
