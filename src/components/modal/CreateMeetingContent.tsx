import React, { useState } from 'react';
import './CreateMeetingContent.css';
import TextInput from '../common/TextInput';
import { useAuthStore } from '../../stores/authStore';
import formatToISO from '../../utils/formatToISO';
import type { CreateMeetingRequest } from '../../apis/Types';
import { createMeetingRoom } from '../../apis/Meeting';
import { useModalStore } from '../../stores/modalStore';

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
    
    const { closeModal } = useModalStore();

    const [isAiSummaryOn, setAiSummaryOn] = useState<boolean>(true); // AI 요약 토글 스위치
    const [meetingName, setMeetingName] = useState<string>(""); // 회의실 이름
    const [date, setDate] = useState(getInitialDateTime().date);
    const [time, setTime] = useState(getInitialDateTime().time);
    const [participantEmails, setParticipantEmails] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    // user 정보가 로드되면 참가자 이메일에 추가
    // useEffect(() => {
    //     if (user?.email && !participantEmails.includes(user.email)) {
    //         setParticipantEmails([user.email]);
    //     }
    // }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null)

        if (!meetingName.trim()) {
            setError("회의실 이름을 입력해주세요.");
            return;
        }
        setBusy(true);
        try {
            const scheduledAtISOString = formatToISO(date, time);
            const uniqueParticipantEmails = Array.from(new Set(participantEmails.filter((email): email is string => !!email)));
            
            const payload: CreateMeetingRequest = {
                title: meetingName,
                scheduledAt: scheduledAtISOString,
                useAiMinutes: isAiSummaryOn,
                participantEmails: uniqueParticipantEmails,
            };
            console.log("API 요청 페이로드:", payload);
            await createMeetingRoom(payload);

            console.log("회의 생성 데이터:", meetingName, date, time);
            alert('회의가 성공적으로 생성되었습니다!');
            closeModal()
        } catch (err: any) {
            console.error("회의 생성 실패:", err);
            setError(err.message || "회의 생성 중 오류가 발생했습니다.");
        } finally {
            setBusy(false);
        }
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
                <button type="button" className="invite-button" aria-label="참석자 초대">
                    <PersonPlusIcon />
                </button>

                <div className='toggle-and-submit'>
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

                    <button type="submit" className="create-button">
                        회의 생성 +
                    </button>
                </div>
            </div>
            {error && <p className="form-error">{error}</p>}
        </form>
    );
}

export default CreateMeetingContent;