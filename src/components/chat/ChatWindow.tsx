import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import "./ChatWindow.css";

const ChatWindow = () => {
    const { activeRoomId, messages, sendMessage } = useChatStore();
    const { user } = useAuthStore();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage("");
        }
    };

    if (!activeRoomId) {
        return (
            <div className="chat-window-placeholder">
                <p>
                    대화 목록에서
                    <br />
                    채팅방을 선택해주세요.
                </p>
            </div>
        );
    }

    return (
        <div className="chat-window-container">
            <div className="messages-container">
                {messages.map((msg) => (
                    <div key={msg.messageId} className={`message-bubble ${msg.senderId === user?.userId ? "sent" : "received"}`}>
                        {msg.senderId !== user?.userId && <div className="sender-name">{msg.senderName}</div>}
                        <div className="message-content">{msg.content}</div>
                        <div className="message-timestamp">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="message-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                />
                <button type="submit" className="send-button">
                    전송
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
