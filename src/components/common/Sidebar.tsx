import { useMemo, type JSX, useState, useEffect } from "react"; // 1. useState, useEffect import
import "./Sidebar.css";
import { PATH } from "../../types/paths";
import { useAuthStore } from "../../stores/authStore";
import { useChatStore } from "../../stores/chatStore";
import { logout as apiLogout } from "../../apis/Auth";
import { useNavigate } from "react-router-dom";
import { IconAISummary, IconMoon, IconSun } from "../../assets/icons"; // 2. IconMoon, IconSun import
import ThemeTransitionOverlay from "./ThemeTransitionOverlay";

// ... (IconHome, IconCalendar 등 다른 아이콘 컴포넌트는 그대로 둡니다)
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
    onClick?: () => void;
    disabled?: boolean;
};

type SidebarProps = {
    onNavigate?: (key: string) => void;
    activeKey?: string;
    onOpenCreateModal?: () => void;
    onOpenJoinModal?: () => void;
    onOpenAiAssistantModal?: () => void;
};

export default function Sidebar({ onNavigate, activeKey, onOpenCreateModal, onOpenJoinModal, onOpenAiAssistantModal }: SidebarProps) {
    const { user, logout: logoutFromStore } = useAuthStore();
    const { chatRooms } = useChatStore();
    const totalUnreadCount = useMemo(() => {
        return chatRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
    }, [chatRooms]);
    const nav = useNavigate();
    
    // 3. 테마 관리 로직을 Sidebar 컴포넌트 내에 직접 작성합니다.
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        if (isThemeTransitioning) return    ; // 전환 중에는 재실행 방지

        setIsThemeTransitioning(true);

        setTimeout(() => {
            setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
        }, 1000);
        // setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // 3. CSS 애니메이션이 끝나면 상태를 false로 변경
    const handleAnimationEnd = () => {
        setIsThemeTransitioning(false);
    };

    const hasCompany = !!user?.company;
    const isUserRole = user?.role === "USER";

    const items: NavItem[] = useMemo(
        () => [
            { key: PATH.COMMANDER, label: "HOME", icon: <IconHome /> },
            { key: PATH.DASHBOARD, label: "대시보드", icon: <IconCalendar /> },
            { key: PATH.CONTRACT, label: "전자 계약", icon: <IconContract />, disabled: isUserRole },
            { key: PATH.MESSENGER, label: "메신저", icon: <IconMessenger />, disabled: !hasCompany },
            { key: "create", label: "회의 생성", icon: <IconVideo />, onClick: onOpenCreateModal },
            { key: "join", label: "회의 참여", icon: <IconVideo />, onClick: onOpenJoinModal },
            {
                key: "aiAssistant",
                label: "AI 비서",
                icon: <IconAISummary strokeWidth="1.5" />,
                onClick: onOpenAiAssistantModal,
                disabled: !hasCompany,
            },
        ],
        [onOpenCreateModal, onOpenJoinModal, onOpenAiAssistantModal, user]
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
            {user && (
                <div className="user">
                    {/* 4. 이름과 버튼을 묶는 div 추가 */}
                    <div className="user-profile-header">
                        <div className="user-name" title={user.name}>
                            {user.name}
                        </div>
                        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="테마 전환">
                            {theme === 'light' ? <IconMoon /> : <IconSun />}
                        </button>
                    </div>
                    <div className="user-email" title={user.email}>
                        {user.email}
                    </div>
                </div>
            )}

            <nav className="nav" aria-label="사이드바 메뉴">
                {items.map((item) => {
                    const isDisabled = !!item.disabled;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            className={`nav-item ${activeKey?.startsWith(item.key) ? "is-active-sidebar" : ""}`}
                            onClick={() => {
                                if (isDisabled) return;
                                if (item.onClick) {
                                    item.onClick();
                                } else {
                                    onNavigate?.(item.key);
                                }
                            }}
                            disabled={isDisabled}>
                            <span className="icon-sidebar">{item.icon}</span>
                            <span className="label">{item.label}</span>
                            {item.key === PATH.MESSENGER && totalUnreadCount > 0 && <span id="sidebar-unread-badge">{totalUnreadCount}</span>}
                            {isDisabled && <span className="tooltip">권한 필요</span>}
                        </button>
                    );
                })}
            </nav>

            <div className="logout">
                <button type="button" className="logout-btn" onClick={handleLogout}>
                    <span className="icon-sidebar">
                        <IconPower />
                    </span>
                    <span className="label danger">로그아웃</span>
                </button>
            </div>
            <ThemeTransitionOverlay
                isTransitioning={isThemeTransitioning}
                onAnimationEnd={handleAnimationEnd}
                isDark={theme !== 'light'}
            />
        </aside>
    );
}