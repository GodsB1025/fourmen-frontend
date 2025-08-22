import React from "react";
import "./MeetingRoomList.css";
import type { Meeting } from "../../apis/Types";

const iconUser = () => {
    return(
        <svg 
            xmlns="http://www.w3.org/2000/svg" width="1.1rem" height="1.1rem" viewBox="0 0 24 24" 
            fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className="lucide lucide-user-round-icon lucide-user-round"
        >
                <circle cx="12" cy="8" r="5"/>
                <path d="M20 21a8 8 0 0 0-16 0"/>
        </svg>
    )
}

interface MeetingRoomListProps {
    busy: boolean;
    error: string | null;
    meetingRooms: Meeting[];
    handleClick: (meetingId: number) => void;
    joiningId: number | null; // 현재 입장 시도 중인 회의 ID prop 추가
}

const formatKST = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
};

const MeetingRoomList = ({ busy, error, meetingRooms, handleClick, joiningId }: MeetingRoomListProps) => {
    if (busy) {
        return <div className="status-container">목록을 불러오는 중...</div>;
    }
    if (error) {
        return <div className="status-container error">{error}</div>;
    }
    if (meetingRooms.length === 0) {
        return <div className="status-container">참여할 수 있는 회의가 없습니다.</div>;
    }

    return (
        <div className="list-container">
            <ul className="meeting-grid">
                {meetingRooms.map((room) => {
                    // 현재 카드의 회의가 입장 시도 중인 회의인지 확인
                    const isJoining = joiningId === room.meetingId;
                    return (
                        <li key={room.meetingId} className="meeting-card">
                            <div className="card-header">
                                <h3 className="card-title">{room.title}</h3>

                                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                    <span className="info-label">{iconUser()}</span>
                                    <span className="info-value">{room.participantsCount}</span>
                                </div>

                                <span className={`ai-badge ${room.useAiMinutes ? "active" : ""}`}>
                                    {room.useAiMinutes ? "AI 요약 ON" : "AI 요약 OFF"}
                                </span>
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">주최자</span>
                                    <span className="info-value">{room.hostName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">예정 시간</span>
                                    <span className="info-value">{formatKST(room.scheduledAt)}</span>
                                </div>
                                <div className="info-row">
                                <button
                                    className="join-btn"
                                    onClick={() => handleClick(room.meetingId)}
                                    disabled={isJoining} // 입장 시도 중이면 버튼 비활성화
                                >
                                    {isJoining ? "입장 중..." : "회의 참가"}
                                </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default MeetingRoomList;
