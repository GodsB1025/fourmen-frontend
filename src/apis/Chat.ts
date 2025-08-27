import api from "./Client";
// 채팅방 타입 정의에 unreadCount 추가
export interface ChatRoom {
    roomId: number;
    roomName: string;
    roomType: "COMPANY" | "PERSONAL";
    unreadCount: number; // 안 읽은 메시지 수
}

// ... (ChatMessage 인터페이스 및 다른 함수들은 기존과 동일)
export interface ChatMessage {
    messageId: number;
    roomId: number;
    senderId: number;
    senderName: string;
    content: string;
    createdAt: string;
}

export const getMyChatRooms = async (): Promise<ChatRoom[]> => {
    const { data } = await api.get("/chat/rooms");
    return data.data;
};

export const getChatHistory = async (roomId: number): Promise<ChatMessage[]> => {
    const { data } = await api.get(`/chat/rooms/${roomId}/messages`);
    return data.data;
};

export const createPersonalChatRoom = async (partnerId: number): Promise<ChatRoom> => {
    const { data } = await api.post(`/chat/rooms/personal/${partnerId}`);
    return data.data;
};
