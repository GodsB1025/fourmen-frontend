import { useMemo, type JSX } from "react";
import "./Sidebar.css";
import { PATH } from "../../types/paths";

type NavItem = {
  key: string;
  label: string;
  icon: JSX.Element;
  onClick?: () => void; // 각 아이템에 대한 커스텀 클릭 핸들러 (선택 사항)
};

type SidebarProps = {
  userName: string;
  userEmail: string;
  onLogout?: () => void;
  onNavigate?: (key: string) => void;
  activeKey?: string;
  onOpenCreateModal?: () => void; // 모달을 열기 위한 함수들을 props로 받음
  onOpenJoinModal?: () => void;
};

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z"
        fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2"
        fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 2v4M16 2v4M3 9h18"
        fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconVideo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="3" y="6" width="14" height="12" rx="2"
        fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 10.5 21 8v8l-4-2.5v-3Z"
        fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconContract() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 3v4h4M8 10h8M8 14h8"
        fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconPower() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M12 2v10" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.3 6.8a8 8 0 1 0 13.4 0"
        fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function Sidebar({
  userName,
  userEmail,
  onLogout,
  onNavigate,
  activeKey,
  onOpenCreateModal,
  onOpenJoinModal,
}: SidebarProps) {
  const items: NavItem[] = useMemo(
    () => [
      { key: PATH.COMMANDER, label: "HOME", icon: <IconHome /> },
      { key: PATH.DASHBOARD, label: "대시보드", icon: <IconCalendar /> },
      { key: "create", label: "회의 생성", icon: <IconVideo />, onClick: onOpenCreateModal },
      { key: "join", label: "회의 참가", icon: <IconVideo />, onClick: onOpenJoinModal },
      { key: PATH.CONTRACT,  label: "전자 계약", icon: <IconContract /> },
    ],
    [onOpenCreateModal, onOpenJoinModal] //
  );

  return (
    <aside className="sidebar" role="complementary" aria-label="사이드바">
      {/* 사용자 정보 (아바타 없음) */}
      <div className="user">
        <div className="user-name" title={userName}>{userName}</div>
        <div className="user-email" title={userEmail}>{userEmail}</div>
      </div>

      {/* 내비게이션 */}
      <nav className="nav" aria-label="사이드바 메뉴">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`nav-item ${activeKey === item.key ? "is-active" : ""}`} //
            onClick={() => {
              if (item.onClick) {
                item.onClick(); // 커스텀  onClick이 있으면 그걸 실행
              } else {
                onNavigate?.(item.key);
              }
            }}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 로그아웃 */}
      <div className="logout">
        <button
          type="button"
          className="logout-btn"
          onClick={onLogout}
        >
          <span className="icon"><IconPower /></span>
          <span className="label danger">로그아웃</span>
        </button>
      </div>
    </aside>
  );
}