/// <reference types="vite/client" />

interface Window {
    global: Window & typeof globalThis;
}
