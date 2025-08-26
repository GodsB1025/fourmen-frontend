import { useMemo, type JSX } from "react";
import "./Sidebar.css";
import { PATH } from "../../types/paths";
import { useAuthStore } from "../../stores/authStore";
import { useChatStore } from "../../stores/chatStore";
import { logout as apiLogout } from "../../apis/Auth";
import { useNavigate } from "react-router-dom";
import { IconAISummary } from "../../assets/icons";

function IconHome() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
function IconCalendar() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <rect x="3" y="4" width="18" height="17" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 2v4M16 2v4M3 9h18" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
function IconVideo() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <rect x="3" y="6" width="14" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M17 10.5 21 8v8l-4-2.5v-3Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
function IconContract() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M15 3v4h4M8 10h8M8 14h8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
function IconPower() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" color="#F93737">
            <path d="M12 2v10" stroke="currentColor" strokeWidth="1.6" />
            <path d="M5.3 6.8a8 8 0 1 0 13.4 0" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
    );
}

function IconMessenger() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

type NavItem = {
    key: string;
    label: string;
    icon: JSX.Element;
    onClick?: () => void; // 각 아이템에 대한 커스텀 클릭 핸들러 (선택 사항)
};

type SidebarProps = {
    onNavigate?: (key: string) => void;
    activeKey?: string;
    onOpenCreateModal?: () => void; // 모달을 열기 위한 함수들을 props로 받음
    onOpenJoinModal?: () => void;
    onOpenAiAssistantModal?: () => void; // AI 비서 모달 핸들러 추가
};

export default function Sidebar({
    onNavigate,
    activeKey,
    onOpenCreateModal,
    onOpenJoinModal,
    onOpenAiAssistantModal, // props 추가
}: SidebarProps) {
    const { user, logout: logoutFromStore } = useAuthStore();
    const { chatRooms } = useChatStore();
    const totalUnreadCount = useMemo(() => {
        return chatRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
    }, [chatRooms]);
    const nav = useNavigate();

    const items: NavItem[] = useMemo(
        () => [
            { key: PATH.COMMANDER, label: "HOME", icon: <IconHome /> },
            { key: PATH.DASHBOARD, label: "대시보드", icon: <IconCalendar /> },
            { key: PATH.CONTRACT, label: "전자 계약", icon: <IconContract /> },
            { key: PATH.MESSENGER, label: "메신저", icon: <IconMessenger /> },
            { key: "create", label: "회의 생성", icon: <IconVideo />, onClick: onOpenCreateModal },
            { key: "join", label: "회의 참가", icon: <IconVideo />, onClick: onOpenJoinModal },
            { key: "aiAssistant", label: "AI 비서", icon: <IconAISummary strokeWidth="1.5" />, onClick: onOpenAiAssistantModal }, // AI 비서 메뉴 추가
        ],
        [onOpenCreateModal, onOpenJoinModal, onOpenAiAssistantModal] //
    );

    const handleLogout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error("logout fail", error);
        } finally {
            logoutFromStore();
            nav(PATH.ROOT, { replace: true });
        }
    };

    return (
        <aside className="sidebar" role="complementary" aria-label="사이드바">
            {/* 사용자 정보 (아바타 없음) */}
            {user && (
                <div className="user">
                    <div className="user-name" title={user.name}>
                        {user.name}
                    </div>
                    <div className="user-email" title={user.email}>
                        {user.email}
                    </div>
                </div>
            )}

            {/* 내비게이션 */}
            <nav className="nav" aria-label="사이드바 메뉴">
                {items.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`nav-item ${activeKey?.startsWith(item.key) ? "is-active-sidebar" : ""}`} //
                        onClick={() => {
                            if (item.onClick) {
                                item.onClick(); // 커스텀  onClick이 있으면 그걸 실행
                            } else {
                                onNavigate?.(item.key);
                            }
                        }}>
                        <span className="icon-sidebar">{item.icon}</span>
                        <span className="label">{item.label}</span>
                        {item.key === PATH.MESSENGER && totalUnreadCount > 0 && <span id="sidebar-unread-badge">{totalUnreadCount}</span>}
                    </button>
                ))}
            </nav>

            {/* 로그아웃 */}
            <div className="logout">
                <button type="button" className="logout-btn" onClick={handleLogout}>
                    <span className="icon-sidebar">
                        <IconPower />
                    </span>
                    <span className="label danger">로그아웃</span>
                </button>
            </div>
        </aside>
    );
}
