// import React from "react";
import { IconPlus } from "../../assets/icons";
import { useChatStore } from "../../stores/chatStore";
import "./ChatRoomList.css";

interface ChatRoomListProps {
    onNewChat: () => void;
}

const ChatRoomList = ({ onNewChat }: ChatRoomListProps) => {
    const { chatRooms, activeRoomId, setActiveRoom } = useChatStore();

    return (
        <div className="chatroom-list-container">
            <header className="chatroom-list-header">
                <h2>대화 목록</h2>
                <button className="new-chat-button" onClick={onNewChat}>
                    <IconPlus/>
                </button>
            </header>
            <ul className="chatroom-list">
                {chatRooms.map((room) => (
                    <li
                        key={room.roomId}
                        className={`chatroom-item ${room.roomId === activeRoomId ? "active" : ""}`}
                        onClick={() => setActiveRoom(room.roomId)}>
                        <span className="chatroom-name">{room.roomName}</span>
                        {/* unreadCount가 0보다 크면 뱃지 표시 */}
                        {room.unreadCount > 0 && <span className="unread-badge">{room.unreadCount}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChatRoomList;
