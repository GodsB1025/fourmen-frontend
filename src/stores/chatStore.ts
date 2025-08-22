import { create } from "zustand";
import { stompClient } from "../services/stompClient";
import type { ChatRoom, ChatMessage } from "../apis/Chat";
import { getMyChatRooms, getChatHistory, createPersonalChatRoom } from "../apis/Chat";

interface ChatState {
    isConnected: boolean;
    chatRooms: ChatRoom[];
    activeRoomId: number | null;
    messages: ChatMessage[];
    error: string | null;

    // Actions
    connect: () => void;
    disconnect: () => void;
    fetchChatRooms: () => Promise<void>;
    setActiveRoom: (roomId: number | null) => Promise<void>;
    sendMessage: (content: string) => void;
    createPersonalRoom: (partnerId: number) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    isConnected: false,
    chatRooms: [],
    activeRoomId: null,
    messages: [],
    error: null,

    connect: () => {
        stompClient.connect(() => {
            set({ isConnected: true });
            const { chatRooms, activeRoomId } = get();

            // 모든 채팅방에 대해 구독 설정
            chatRooms.forEach((room) => {
                stompClient.subscribeToRoom(room.roomId, (message) => {
                    const state = get();
                    if (state.activeRoomId === message.roomId) {
                        // 현재 보고 있는 채팅방이면 메시지 목록에 추가
                        set({ messages: [...state.messages, message] });
                    } else {
                        // 다른 채팅방이면 unreadCount 증가
                        const updatedRooms = state.chatRooms.map((r) =>
                            r.roomId === message.roomId ? { ...r, unreadCount: (r.unreadCount || 0) + 1 } : r
                        );
                        set({ chatRooms: updatedRooms });
                    }
                });
            });
        });
    },

    disconnect: () => {
        stompClient.disconnect();
        set({ isConnected: false });
    },

    fetchChatRooms: async () => {
        try {
            const rooms = await getMyChatRooms();
            set({ chatRooms: rooms, error: null });
            // 채팅방 목록을 가져온 후, STOMP 연결이 되어 있다면 모든 방을 구독
            if (get().isConnected) {
                rooms.forEach((room) => {
                    stompClient.subscribeToRoom(room.roomId, (message) => {
                        const state = get();
                        if (state.activeRoomId === message.roomId) {
                            set({ messages: [...state.messages, message] });
                        } else {
                            const updatedRooms = state.chatRooms.map((r) =>
                                r.roomId === message.roomId ? { ...r, unreadCount: (r.unreadCount || 0) + 1 } : r
                            );
                            set({ chatRooms: updatedRooms });
                        }
                    });
                });
            }
        } catch (e: any) {
            set({ error: "채팅방 목록을 불러오는데 실패했습니다." });
        }
    },

    setActiveRoom: async (roomId: number | null) => {
        if (roomId === null) {
            set({ activeRoomId: null, messages: [] });
            return;
        }

        // 채팅방을 활성화하면 해당 방의 unreadCount를 0으로 리셋
        const updatedRooms = get().chatRooms.map((r) => (r.roomId === roomId ? { ...r, unreadCount: 0 } : r));
        set({ activeRoomId: roomId, messages: [], error: null, chatRooms: updatedRooms });

        try {
            const history = await getChatHistory(roomId);
            set({ messages: history });
        } catch (e: any) {
            set({ error: "대화 내역을 불러오는데 실패했습니다." });
        }
    },

    sendMessage: (content: string) => {
        const { activeRoomId, isConnected } = get();
        if (activeRoomId && content.trim() && isConnected) {
            stompClient.sendMessage(activeRoomId, content);
        }
    },

    createPersonalRoom: async (partnerId: number) => {
        try {
            const newRoom = await createPersonalChatRoom(partnerId);
            // 개인 채팅방 생성 후 목록을 새로고침하고 해당 방으로 바로 이동
            await get().fetchChatRooms();
            await get().setActiveRoom(newRoom.roomId);
        } catch (e: any) {
            set({ error: "1:1 채팅방을 만드는데 실패했습니다." });
        }
    },
}));
