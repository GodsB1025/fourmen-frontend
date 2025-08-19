import React, { useState } from 'react';
import './CreateMeetingContent.css';
import TextInput from '../common/TextInput';
import { useAuthStore } from '../../stores/authStore';
import formatToISO from '../../utils/formatToISO';
import type { CreateMeetingRequest, User } from '../../apis/Types';
import { createMeetingRoom } from '../../apis/Meeting';
import { useModalStore } from '../../stores/modalStore';
import { replace, useNavigate } from 'react-router-dom';

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
    
    const navigate = useNavigate()
    const { closeModal } = useModalStore();
    const user = useAuthStore((state) => state.user)

    const [isAiSummaryOn, setAiSummaryOn] = useState<boolean>(true); // AI 요약 토글 스위치
    const [meetingName, setMeetingName] = useState<string>(""); // 회의실 이름
    const [date, setDate] = useState(getInitialDateTime().date);
    const [time, setTime] = useState(getInitialDateTime().time);
    const [participantEmails, setParticipantEmails] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState<string>(""); // <-- 현재 입력 중인 이메일 상태 추가
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    // 이메일 추가 핸들러
    const handleAddParticipant = () => {
        // 간단한 이메일 형식 유효성 검사
        if (!currentEmail.includes('@')) {
            setError("올바른 이메일 형식이 아닙니다.");
            return;
        }
        // 중복 이메일 방지
        if (user && currentEmail === user.email
            || participantEmails.includes(currentEmail)
        ) {
            setError("이미 추가된 이메일입니다.");
            setCurrentEmail(""); // 입력 필드 초기화
            return;   
        }

        setParticipantEmails([...participantEmails, currentEmail]);
        setCurrentEmail(""); // 입력 필드 초기화
        setError(null); // 에러 메시지 초기화
    };

    // Enter 키로 이메일 추가를 위한 핸들러
    const handleEmailInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Form 전체 제출 방지
            handleAddParticipant();
        }
    };

    // 이메일 삭제 핸들러
    const handleRemoveParticipant = (emailToRemove: string) => {
        setParticipantEmails(participantEmails.filter(email => email !== emailToRemove));
    };

    // 회의 생성 submit 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!meetingName.trim()) {
            setError("회의실 이름을 입력해주세요.");
            return;
        }
        setBusy(true);
        try {
            const scheduledAtISOString = formatToISO(date, time);
            // participantEmails 상태를 그대로 사용 (이미 생성자는 제외되어 있음)
            const uniqueParticipantEmails = Array.from(new Set(participantEmails.filter(Boolean)));
            
            const payload: CreateMeetingRequest = {
                title: meetingName,
                scheduledAt: scheduledAtISOString,
                useAiMinutes: isAiSummaryOn,
                participantEmails: uniqueParticipantEmails, // 생성자가 제외된 순수 초대자 목록
            };
            
            console.log("API 요청 페이로드:", payload);
            await createMeetingRoom(payload);

            alert('회의가 성공적으로 생성되었습니다!');
            closeModal();
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
            
            {/* 참석자 초대 UI */}
            <div className="form-group participant-section">
                <label>참석자 초대</label>
                <div className="participant-input-wrapper">
                    <TextInput
                        type='email'
                        placeholder='이메일로 초대하기'
                        value={currentEmail}
                        onChange={e => setCurrentEmail(e.target.value)}
                        onKeyDown={handleEmailInputKeyDown}
                    />
                    {/* PersonPlusIcon을 추가 버튼으로 활용 */}
                    <button type="button" onClick={handleAddParticipant} className="add-button" aria-label="참석자 추가">
                        <PersonPlusIcon />
                    </button>
                </div>

                {/* 추가된 이메일 목록 (태그 형태) */}
                <div className="participant-list">
                    {/* 1. 생성자(본인) 태그를 먼저 표시 */}
                    {user?.email && (
                        <div className="participant-tag me">
                            <span>{user.email} (나)</span>
                            {/* 본인 태그에는 삭제 버튼 없음 */}
                        </div>
                    )}

                    {/* 2. participantEmails 상태에 있는 초대자 목록을 표시 */}
                    {participantEmails.map((email, index) => (
                        <div key={index} className="participant-tag">
                            <span>{email}</span>
                            <button type="button" onClick={() => handleRemoveParticipant(email)}>
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            </div>

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
            {error && <p className="form-error">{error}</p>}
        </form>
    );
}

export default CreateMeetingContent;