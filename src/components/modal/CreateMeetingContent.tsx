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


const CreateMeetingContent = () => {
    // 컴포넌트가 처음 렌더링될 때 현재 시간을 가져와 초기 상태를 설정합니다.
    const getInitialDateTime = () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2); // '25'
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 1월은 0부터 시작하므로 +1, 두 자리로 포맷팅
        const day = now.getDate().toString().padStart(2, '0'); // 두 자리로 포맷팅

        const hours = now.getHours(); // 0-23시
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour = (hours % 12 || 12).toString().padStart(2, '0'); // 12시간 형식으로 변환 및 포맷팅 (0시는 12시로)
        const minute = now.getMinutes().toString().padStart(2, '0'); // 두 자리로 포맷팅

        return {
            date: { year, month, day },
            time: { ampm, hour, minute },
        };
    };

    // AI 요약 토글 스위치의 상태를 관리합니다.
    const [isAiSummaryOn, setAiSummaryOn] = useState<boolean>(true);

    // 회의실 이름 상태
    const [meetingName, setMeetingName] = useState<string>("");

    // useState에 함수를 전달하여 초기 렌더링 시에만 실행되도록 합니다. (Lazy initial state)
    const [date, setDate] = useState(getInitialDateTime().date);
    const [time, setTime] = useState(getInitialDateTime().time);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 폼 제출 로직 (예: 서버로 데이터 전송)
        console.log("회의 생성 데이터:", );
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

export default CreateMeetingContent