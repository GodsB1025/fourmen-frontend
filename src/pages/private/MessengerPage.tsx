import React, { useState, useEffect } from "react";
import ChatRoomList from "../../components/chat/ChatRoomList";
import ChatWindow from "../../components/chat/ChatWindow";
import NewChatModal from "../../components/chat/NewChatModal";
import "./MessengerPage.css";
import { useAuthStore } from "../../stores/authStore";
import { Navigate } from "react-router-dom";
import { PATH } from "../../types/paths";
import Toast from "../../components/common/Toast"; // Toast 컴포넌트 import

const MessengerPage = () => {
    const [isNewChatModalOpen, setNewChatModalOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const [showGuardToast, setShowGuardToast] = useState(false); // Toast 표시 상태

    useEffect(() => {
        if (!user?.company) {
            setShowGuardToast(true);
        }
    }, [user]);

    if (!user?.company) {
        // 토스트를 보여주고, 잠시 후 리다이렉트
        return (
            <>
                {showGuardToast && (
                    <Toast message="회사에 소속된 사용자만 메신저를 이용할 수 있습니다." onClose={() => setShowGuardToast(false)} type="error" />
                )}
                <Navigate to={PATH.COMMANDER} replace />
            </>
        );
    }

    return (
        <div className="messenger-layout">
            <aside className="messenger-sidebar">
                <ChatRoomList onNewChat={() => setNewChatModalOpen(true)} />
            </aside>
            <main className="messenger-main">
                <ChatWindow />
            </main>
            <NewChatModal isOpen={isNewChatModalOpen} onClose={() => setNewChatModalOpen(false)} />
        </div>
    );
};

export default MessengerPage;
