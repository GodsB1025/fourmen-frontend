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
    connectAndFetch: () => void;
    disconnect: () => void;
    fetchChatRooms: () => Promise<void>; // fetchChatRooms를 다시 추가합니다.
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

    connectAndFetch: () => {
        if (get().isConnected) return;

        stompClient.connect(() => {
            set({ isConnected: true });
            get().fetchChatRooms(); // 연결 후 fetchChatRooms 호출
        });
    },

    disconnect: () => {
        stompClient.disconnect();
        set({ isConnected: false, chatRooms: [], activeRoomId: null, messages: [] });
    },

    // fetchChatRooms 액션을 다시 구현합니다.
    fetchChatRooms: async () => {
        try {
            const rooms = await getMyChatRooms();
            set({ chatRooms: rooms, error: null });

            if (get().isConnected) {
                rooms.forEach((room) => {
                    stompClient.subscribeToRoom(room.roomId, (message) => {
                        const state = get();
                        if (state.activeRoomId === message.roomId) {
                            set((prevState) => ({ messages: [...prevState.messages, message] }));
                            const updatedRooms = state.chatRooms.map((r) => (r.roomId === message.roomId ? { ...r, unreadCount: 0 } : r));
                            set({ chatRooms: updatedRooms });
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
            // 이제 fetchChatRooms가 존재하므로 정상적으로 호출됩니다.
            await get().fetchChatRooms();
            await get().setActiveRoom(newRoom.roomId);
        } catch (e: any) {
            set({ error: "1:1 채팅방을 만드는데 실패했습니다." });
        }
    },
}));
