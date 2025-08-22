import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessage } from "../apis/Chat";

// 메시지를 수신했을 때 실행할 콜백 함수 타입 정의
type MessageCallback = (message: ChatMessage) => void;

class StompClientService {
    private client: Client;
    private subscriptions: Map<string, any> = new Map(); // 구독 정보를 저장할 Map

    constructor() {
        this.client = new Client({
            // SockJS를 웹소켓 생성자로 사용
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws/chat`),

            connectHeaders: {
                // 현재는 쿠키 기반 인증을 사용하므로 특별한 헤더는 필요 없습니다.
                // 만약 Authorization 헤더가 필요하다면 여기에 추가합니다.
                // Authorization: `Bearer ${token}`,
            },

            // 디버그 메시지를 콘솔에 출력
            debug: (str) => {
                console.log(new Date(), str);
            },

            // 10초마다 heartbeat
            reconnectDelay: 10000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onStompError = (frame) => {
            console.error("Broker reported error: " + frame.headers["message"]);
            console.error("Additional details: " + frame.body);
        };
    }

    // STOMP 클라이언트 연결
    public connect(onConnectedCallback?: () => void): void {
        if (!this.client.active) {
            this.client.activate();
            if (onConnectedCallback) {
                this.client.onConnect = onConnectedCallback;
            }
        }
    }

    // STOMP 클라이언트 연결 해제
    public disconnect(): void {
        if (this.client.active) {
            this.client.deactivate();
        }
    }

    // 특정 채팅방 구독
    public subscribeToRoom(roomId: number, callback: MessageCallback): void {
        const destination = `/topic/room/${roomId}`;

        // 이미 구독 중인지 확인
        if (this.subscriptions.has(destination)) {
            console.log(`Already subscribed to ${destination}`);
            return;
        }

        const subscription = this.client.subscribe(destination, (message) => {
            const parsedMessage: ChatMessage = JSON.parse(message.body);
            callback(parsedMessage);
        });

        this.subscriptions.set(destination, subscription);
        console.log(`Subscribed to ${destination}`);
    }

    // 특정 채팅방 구독 취소
    public unsubscribeFromRoom(roomId: number): void {
        const destination = `/topic/room/${roomId}`;
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
            console.log(`Unsubscribed from ${destination}`);
        }
    }

    // 메시지 전송
    public sendMessage(roomId: number, content: string): void {
        if (this.client.active) {
            this.client.publish({
                destination: `/app/chat/room/${roomId}`,
                body: JSON.stringify({ content }),
            });
        } else {
            console.error("STOMP client is not connected.");
        }
    }
}

// 싱글톤 인스턴스로 내보내기
export const stompClient = new StompClientService();
