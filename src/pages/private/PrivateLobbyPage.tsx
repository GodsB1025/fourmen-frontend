import { useEffect, useState } from "react";
import "./PrivateLobbyPage.css";
import { useModalStore } from "../../stores/modalStore";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../types/paths";
import { getTodayEvents } from "../../apis/Calendar";
import type { TodayEvent } from "../../apis/Types";
import { CreateIcon, JoinIcon, ContractIcon, DashboardIcon } from "../../components/common/LobbyIcons";

const formatTime = (isoString: string | null): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

const PrivateLobbyPage = () => {
    const { openModal } = useModalStore();
    const navigate = useNavigate();

    const [todayEvents, setTodayEvents] = useState<TodayEvent[]>([]);
    const [ongoingMeetings, setOngoingMeetings] = useState<TodayEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPageReady, setIsPageReady] = useState(false);

    useEffect(() => {
        // 브라우저가 다음 프레임을 그릴 준비가 되었을 때 상태를 업데이트합니다.
        // 이는 초기 렌더링이 완료되었음을 보장하는 가장 안정적인 방법입니다.
        const animationFrameId = requestAnimationFrame(() => {
            setIsPageReady(true);
        });

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    useEffect(() => {
        const fetchAndProcessEvents = async () => {
            setLoading(true);
            const events = await getTodayEvents();
            const now = new Date();
            const ongoing = events.filter((event) => {
                const startTime = new Date(event.startTime);
                const endTime = event.endTime ? new Date(event.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000);
                return now >= startTime && now <= endTime;
            });
            const upcoming = events.filter((event) => !ongoing.some((o) => o.eventId === event.eventId));
            setOngoingMeetings(ongoing);
            setTodayEvents(upcoming);
            setLoading(false);
        };

        fetchAndProcessEvents();
        const intervalId = setInterval(fetchAndProcessEvents, 60000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        // isPageReady 상태에 따라 'ready' 클래스를 동적으로 추가합니다.
        <div className={`lobby-container ${isPageReady ? "ready" : ""}`}>
            <main className="main-content">
                <div>
                    <h2 className="section-title">오늘의 일정</h2>
                    {loading ? (
                        <div className="loading-placeholder">일정을 불러오는 중...</div>
                    ) : todayEvents.length > 0 ? (
                        <ul className="todo-list">
                            {todayEvents.map((event) => (
                                <li key={event.eventId} className={`todo-item type-${event.eventType.toLowerCase()}`}>
                                    <span className="item-time">{formatTime(event.startTime)}</span>
                                    <span className="item-title">{event.title}</span>
                                    <span className="item-type-badge">{event.eventType === "MEETING" ? "회의" : "개인"}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="empty-placeholder">
                            <p>오늘 예정된 할 일이 없습니다.</p>
                            <span>새로운 회의를 생성하거나 개인 일정을 추가해보세요.</span>
                        </div>
                    )}
                </div>
                <div className="ongoing-section">
                    <h3 className="section-title-small">현재 진행중인 미팅</h3>
                    {loading ? (
                        <div className="loading-placeholder-small">...</div>
                    ) : ongoingMeetings.length > 0 ? (
                        <ul className="ongoing-list">
                            {ongoingMeetings.map((meeting) => (
                                <li key={meeting.eventId} className="ongoing-item">
                                    <span className="ongoing-title">{meeting.title}</span>
                                    <span className="ongoing-time">{`${formatTime(meeting.startTime)} ~ ${formatTime(meeting.endTime)}`}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-items-text">현재 진행 중인 미팅이 없습니다.</p>
                    )}
                </div>
            </main>
            <aside className="side-panel">
                <div className="action-grid">
                    <button className="lobby-action-button" onClick={() => openModal("create")}>
                        <CreateIcon />
                        <span className="action-button__label">회의 생성</span>
                    </button>
                    <button className="lobby-action-button" onClick={() => openModal("join")}>
                        <JoinIcon />
                        <span className="action-button__label">회의 참여</span>
                    </button>
                    <button className="lobby-action-button" onClick={() => navigate(PATH.CONTRACT)}>
                        <ContractIcon />
                        <span className="action-button__label">전자 계약</span>
                    </button>
                    <button className="lobby-action-button" onClick={() => navigate(PATH.DASHBOARD)}>
                        <DashboardIcon />
                        <span className="action-button__label">대시보드</span>
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default PrivateLobbyPage;
