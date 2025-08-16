import React from 'react'
import './MeetingRoomList.css'
import type { Meeting } from '../../apis/Types';

interface MeetingRoomListProps {
    busy: boolean,
    error: string | null,
    meetingRooms: Meeting[]
    handleClick: (meetingId: number) => void
}

const MeetingRoomList = ({
    busy,
    error,
    meetingRooms,
    handleClick
}: MeetingRoomListProps) => {
    if (busy) {
        return <div className="meeting-status">목록을 불러오는 중...</div>;
    }
    if (error) {
        return <div className="meeting-status error">{error}</div>;
    }
    if (meetingRooms.length === 0) {
        return <div className="meeting-status">참여할 수 있는 회의가 없습니다.</div>;
    }
    return (
        <div className="meeting-list-container">
            <ul className="meeting-list">
                {meetingRooms.map((room) => (
                    <li key={room.meetingId} className="meeting-item">
                        <div className="meeting-info">
                            <span className="meeting-title">{room.title}</span>
                            <span className="meeting-details">
                                주최자: {room.hostName} | 시간: {new Date(room.scheduledAt).toLocaleString()}
                            </span>
                        </div>
                        <button className="join-button" onClick={() => handleClick(room.meetingId)}>
                            참가
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MeetingRoomList