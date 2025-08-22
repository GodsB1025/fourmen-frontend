import React, { useEffect, useState } from "react";
import { fetchCompanyMembers } from "../../apis/Company";
import type { CompanyMember } from "../../apis/Types";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import "./NewChatModal.css";

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
    const [members, setMembers] = useState<CompanyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { createPersonalRoom } = useChatStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setError(null);
            fetchCompanyMembers()
                .then((data) => {
                    // 자기 자신은 목록에서 제외
                    const filteredMembers = data.filter((member) => member.id !== user?.userId);
                    setMembers(filteredMembers);
                })
                .catch(() => setError("회사 멤버 목록을 불러오는데 실패했습니다."))
                .finally(() => setLoading(false));
        }
    }, [isOpen, user]);

    const handleStartChat = async (partnerId: number) => {
        await createPersonalRoom(partnerId);
        onClose(); // 채팅방 생성 후 모달 닫기
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="new-chat-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="new-chat-modal-header">
                    <h2>새로운 대화 시작하기</h2>
                    <button onClick={onClose} className="close-button">
                        &times;
                    </button>
                </header>
                <main className="new-chat-modal-body">
                    {loading ? (
                        <p>멤버 목록을 불러오는 중...</p>
                    ) : error ? (
                        <p className="error-text">{error}</p>
                    ) : (
                        <ul className="member-select-list">
                            {members.map((member) => (
                                <li key={member.id} className="member-select-item" onClick={() => handleStartChat(member.id)}>
                                    <div className="member-info">
                                        <span className="member-name">{member.name}</span>
                                        <span className="member-email">{member.email}</span>
                                    </div>
                                    <button className="start-chat-btn">대화</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </main>
            </div>
        </div>
    );
};

export default NewChatModal;
