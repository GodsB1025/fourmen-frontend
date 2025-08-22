import { Client, type IMessage, type StompHeaders } from "@stomp/stompjs"; // StompHeaders 타입을 직접 import
import SockJS from "sockjs-client";
import type { ChatMessage } from "../apis/Chat";
import Cookies from "js-cookie";

type MessageCallback = (message: ChatMessage) => void;

class StompClientService {
    private client: Client;
    private subscriptions: Map<string, any> = new Map();

    constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws/chat`),
            connectHeaders: {},
            debug: (str) => {
                // console.log(new Date(), str);
            },
            reconnectDelay: 10000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onStompError = (frame) => {
            console.error("Broker reported error: " + frame.headers["message"]);
            console.error("Additional details: " + frame.body);
        };
    }

    public connect(onConnectedCallback?: () => void): void {
        if (!this.client.active) {
            const accessToken = Cookies.get("accessToken");
            if (accessToken) {
                this.client.connectHeaders = {
                    Authorization: `Bearer ${accessToken}`,
                };
            }
            this.client.activate();
            if (onConnectedCallback) {
                this.client.onConnect = onConnectedCallback;
            }
        }
    }

    public disconnect(): void {
        if (this.client.active) {
            this.subscriptions.forEach((sub) => sub.unsubscribe());
            this.subscriptions.clear();
            this.client.deactivate();
        }
    }

    public subscribeToRoom(roomId: number, callback: MessageCallback): void {
        const destination = `/topic/room/${roomId}`;
        if (this.subscriptions.has(destination)) return;
        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            const parsedMessage: ChatMessage = JSON.parse(message.body);
            callback(parsedMessage);
        });
        this.subscriptions.set(destination, subscription);
    }

    public unsubscribeFromRoom(roomId: number): void {
        const destination = `/topic/room/${roomId}`;
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    public sendMessage(roomId: number, content: string): void {
        if (this.client.active) {
            const headers: StompHeaders = {};
            const accessToken = Cookies.get("accessToken");

            if (accessToken) {
                headers.Authorization = `Bearer ${accessToken}`;
            }

            this.client.publish({
                destination: `/app/chat/room/${roomId}`,
                headers: headers,
                body: JSON.stringify({ content }),
            });
        } else {
            console.error("STOMP client is not connected.");
        }
    }
}

export const stompClient = new StompClientService();
