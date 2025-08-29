// ALL/frontend/pages/private/dashboard/ProfilePage.tsx
import { useState } from "react";
import ProfileCalendar from "../../../components/common/ProfileCalendar";
import "./Dashboard.css";
import { useAuthStore } from "../../../stores/authStore";
import MemoAlerts from "../../../pages/private/dashboard/MemoAlerts";

// 아이콘 컴포넌트 (변경 없음)
const UserIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);
const BellIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const ProfilePage = () => {
    const user = useAuthStore((s) => s.user);

    const company = user?.company?.name ?? "소속 없음";
    const roleTitle = user?.role === "ADMIN" ? "관리자" : user?.role === "CONTRACT_ADMIN" ? "계약 관리자" : "일반 사용자";

    const [monthLabel, setMonthLabel] = useState<string>(() => {
        const now = new Date();
        return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
    });

    const handleMonthChange = (d: Date) => {
        setMonthLabel(`${d.getFullYear()}년 ${d.getMonth() + 1}월`);
    };

    return (
        <div className="profile-page-layout">
            {/* --- Top Section: User Info + Alerts --- */}
            <div className="profile-top-section">
                {/* User Info Card */}
                <section className="profile-widget">
                    <h3 className="widget-title">
                        <UserIcon />
                        <span>{user?.name || "사용자"}님의 프로필</span>
                    </h3>
                    <div className="profile-info-card__details">
                        <div className="detail-item">
                            <span className="detail-label">이메일</span>
                            <span className="detail-value">{user?.email || "-"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">소속</span>
                            <span className="detail-value">{company}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">역할</span>
                            <span className="detail-value">{roleTitle}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">연락처</span>
                            <span className="detail-value">{user?.phone || "-"}</span>
                        </div>
                    </div>
                </section>

                <section className="profile-widget">
                    <h3 className="widget-title">
                        <BellIcon />
                        <span>다가오는 일정</span>
                    </h3>
                    <MemoAlerts daysWindow={7} maxLines={5} />
                </section>
            </div>

            {/* --- Bottom Section: Calendar --- */}
            <section className="calendar-full-widget">
                <h3 className="widget-title">{monthLabel}</h3>
                <ProfileCalendar onMonthChange={handleMonthChange} />
            </section>
        </div>
    );
};

export default ProfilePage;
