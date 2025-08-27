import { useState } from "react";
import ChatRoomList from "../../components/chat/ChatRoomList";
import ChatWindow from "../../components/chat/ChatWindow";
import NewChatModal from "../../components/chat/NewChatModal"; // 모달 import
import "./MessengerPage.css";
import { useAuthStore } from "../../stores/authStore";
import { Navigate } from "react-router-dom";
import { PATH } from "../../types/paths";

const MessengerPage = () => {
    const [isNewChatModalOpen, setNewChatModalOpen] = useState(false);
    const user = useAuthStore((state) => state.user);

    if (!user?.company) {
        alert("회사에 소속된 사용자만 메신저를 이용할 수 있습니다.");
        return <Navigate to={PATH.COMMANDER} replace />;
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
