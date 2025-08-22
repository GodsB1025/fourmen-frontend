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

    connectAndFetch: () => void; // 통합된 액션
    disconnect: () => void;
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

    // 1. 연결 및 데이터 로딩/구독을 한번에 처리하는 액션
    connectAndFetch: () => {
        if (get().isConnected) return; // 이미 연결되어 있으면 중복 실행 방지

        stompClient.connect(async () => {
            set({ isConnected: true });
            try {
                // 연결 성공 후 채팅방 목록을 가져옵니다.
                const rooms = await getMyChatRooms();
                set({ chatRooms: rooms, error: null });

                // 가져온 모든 채팅방에 대해 영구적인 구독을 설정합니다.
                rooms.forEach((room) => {
                    stompClient.subscribeToRoom(room.roomId, (message) => {
                        const state = get();
                        if (state.activeRoomId === message.roomId) {
                            // 현재 보고 있는 채팅방이면 메시지 목록에 즉시 추가
                            set({ messages: [...state.messages, message] });
                            // 메시지를 받았으므로, 이 방의 unreadCount는 0이 되어야 합니다.
                            const updatedRooms = state.chatRooms.map((r) => (r.roomId === message.roomId ? { ...r, unreadCount: 0 } : r));
                            set({ chatRooms: updatedRooms });
                        } else {
                            // 다른 채팅방이면 unreadCount만 증가
                            const updatedRooms = state.chatRooms.map((r) =>
                                r.roomId === message.roomId ? { ...r, unreadCount: (r.unreadCount || 0) + 1 } : r
                            );
                            set({ chatRooms: updatedRooms });
                        }
                    });
                });
            } catch (e) {
                set({ error: "채팅방 목록을 불러오는데 실패했습니다." });
            }
        });
    },

    // 2. 연결 해제
    disconnect: () => {
        stompClient.disconnect();
        // 상태 초기화
        set({ isConnected: false, chatRooms: [], activeRoomId: null, messages: [] });
    },

    // 3. 활성 채팅방 변경 (구독 해제 로직 제거)
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

    // 4. 메시지 전송 (변경 없음)
    sendMessage: (content: string) => {
        const { activeRoomId, isConnected } = get();
        if (activeRoomId && content.trim() && isConnected) {
            stompClient.sendMessage(activeRoomId, content);
        }
    },

    // 5. 1:1 채팅방 생성 (변경 없음)
    createPersonalRoom: async (partnerId: number) => {
        try {
            const newRoom = await createPersonalChatRoom(partnerId);
            await get().fetchChatRooms(); // fetchChatRooms 대신 connectAndFetch를 다시 호출할 필요는 없음
            await get().setActiveRoom(newRoom.roomId);
        } catch (e: any) {
            set({ error: "1:1 채팅방을 만드는데 실패했습니다." });
        }
    },
}));
