import React, { useState } from 'react';
import './CreateMeetingContent.css';
import TextInput from '../common/TextInput';

// 사용자 추가 아이콘 SVG를 별도 컴포넌트로 분리하여 가독성을 높입니다.
const PersonPlusIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="1.5" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8v6m-3-3h6" />
    </svg>
);


export default function CreateMeetingContent() {
    // AI 요약 토글 스위치의 상태를 관리합니다.
    const [isAiSummaryOn, setAiSummaryOn] = useState(true);

    // 현재 날짜와 시간을 기본값으로 설정할 수 있습니다.
    // 예시를 위해 이미지의 값으로 초기화합니다.
    const [meetingName, setMeetingName] = useState("");
    const [date, setDate] = useState({ year: '25', month: '08', day: '05' });
    const [time, setTime] = useState({ ampm: 'PM', hour: '05', minute: '59' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 폼 제출 로직 (예: 서버로 데이터 전송)
        console.log("회의 생성 데이터:", {
        // name, date, time, isAiSummaryOn
        });
        alert('회의가 생성되었습니다!');
    };

    return (
        <form className="create-meeting-form" onSubmit={handleSubmit}>
            {/* 회의실 이름 입력 */}
            <div className="form-group">
                <TextInput
                    type='text'
                    placeholder='회의실 이름'
                    value={meetingName}
                    onChange={e => setMeetingName(e.target.value)}
                />
            </div>

            {/* 날짜 및 시간 입력 */}
            <div className="form-row">
                <div className="date-input-group">
                    <TextInput
                        type='text'
                        value={date.year}
                        onChange={e => setDate({...date, year: e.target.value})}
                    />
                    <TextInput
                        type='text'
                        value={date.month}
                        onChange={e => setDate({...date, month: e.target.value})}
                    />
                    <TextInput
                        type='text'
                        value={date.day}
                        onChange={e => setDate({...date, day: e.target.value})}
                    />
                </div>
                <div className="time-input-group">
                    <span>{time.ampm}</span>
                    <TextInput
                        type='text'
                        value={time.hour}
                        onChange={e => setTime({...time, hour: e.target.value})}
                    />
                    <span>:</span>  
                    <TextInput
                        type='text'
                        value={time.minute}
                        onChange={e => setTime({...time, minute: e.target.value})}
                    />
                </div>
            </div>
            
            <div className="form-actions">
                <div className="left-actions">
                <button type="button" className="invite-button" aria-label="참석자 초대">
                    <PersonPlusIcon />
                </button>
                
                <div className="toggle-group">
                    <span className="toggle-label-text">AI 요약</span>
                    <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        checked={isAiSummaryOn} 
                        onChange={() => setAiSummaryOn(!isAiSummaryOn)}
                    />
                    <span className="slider"></span>
                    </label>
                </div>
                </div>

                <button type="submit" className="create-button">
                    회의 생성 +
                </button>
            </div>
        </form>
    );
}