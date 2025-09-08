import React, { useState, useEffect, useRef } from "react";
import "./CreateMeetingContent.css";
import { useAuthStore } from "../../stores/authStore";
import { createMeetingRoom } from "../../apis/Meeting";
import type { CreateMeetingRequest, CompanyMember } from "../../apis/Types";
import { useModalStore } from "../../stores/modalStore";
import { fetchCompanyMembers } from "../../apis/Company";
import TextInput from "../common/TextInput";
import InvitePanelDropdown from "./InvitePanelDropdown";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import './custom-datepicker.css'
import { IconHashTag, IconPlus } from "../../assets/icons";
import { AnimatePresence } from "framer-motion";
import Toast from "../common/Toast";


// --- Main Component ---
const CreateMeetingContent = () => {
    const { closeModal } = useModalStore();
    const user = useAuthStore((state) => state.user);
    
    const [isInvitePanelOpen, setInvitePanelOpen] = useState(false);
    const [meetingName, setMeetingName] = useState("");
    const [scheduledAt, setScheduledAt] = useState(new Date());
    const [isAiSummaryOn, setAiSummaryOn] = useState(user?.company!==null);
    const [participantEmails, setParticipantEmails] = useState<string[]>([]);
    const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);

    const [emailInput, setEmailInput] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null)
    const [busy, setBusy] = useState(false);

    // 드롭다운의 위치 기준이 될 요소에 대한 ref
    const inviteSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user?.company) {
            fetchCompanyMembers()
                .then(setCompanyMembers)
                .catch(() => console.error("회사 멤버 목록을 불러오지 못했습니다."));
        }
    }, [user]);

    const handleRemoveParticipant = (emailToRemove: string) => {
        setParticipantEmails((emails) => emails.filter((email) => email !== emailToRemove));
    };

    // 이메일을 직접 추가하는 핸들러
    const handleAddExternalEmail = () => {
        const newEmail = emailInput.trim();
        if (newEmail && newEmail.includes("@") && !participantEmails.includes(newEmail)) {
            setParticipantEmails(prev => [...prev, newEmail]);
            setEmailInput(""); // 입력창 비우기
        }
    };

    // 드롭다운에서 멤버 선택 핸들러
    const handleSelectParticipant = (email: string) => {
        if (!participantEmails.includes(email)) {
            setParticipantEmails(prev => [...prev, email]);
        }

        // setInvitePanelOpen(false); // 바로 드롭 다운 닫는 건 보류
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!meetingName.trim()) {
            setError("회의 이름을 입력해주세요.");
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const scheduledAtISO = scheduledAt.toISOString();
            const payload: CreateMeetingRequest = {
                title: meetingName.trim(),
                scheduledAt: scheduledAtISO,
                useAiMinutes: isAiSummaryOn,
                participantEmails,
            };

            await createMeetingRoom(payload);
            setSuccess("회의가 성공적으로 생성되었습니다!");
        } catch (err: unknown) {
            let errorMessage = "회의 생성 중 오류가 발생했습니다.";
            if(err instanceof Error) errorMessage = err.message
            setError(errorMessage);
        }
        // } finally {
        //     setBusy(false);
        // }
    };

    return (
        <div className="create-meeting-container">
            <form className="panel main-form-panel" style={{ width: '100%' }} onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="meeting-name">회의 이름</label>
                    <TextInput
                        id="meeting-name"
                        type="text"
                        placeholder="예: 3분기 실적 리뷰"
                        value={meetingName}
                        onChange={(e) => setMeetingName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="meeting-time">회의 시간</label>
                    <DatePicker
                        locale={ko} // 로케일을 한국어로 설정
                        selected={scheduledAt} // 현재 선택된 날짜
                        onChange={(date: Date | null) => {if(date) setScheduledAt(date)}} // 날짜 변경 핸들러
                        showTimeSelect // 시간 선택 기능 활성화
                        timeFormat="HH:mm" // 시간 포맷
                        timeIntervals={15} // 15분 간격으로 시간 선택
                        dateFormat="yyyy년 MM월 dd일 HH:mm" // input에 표시될 날짜 포맷
                        className="custom-datepicker-input" // CSS 클래스 적용
                        disabled={busy}
                        portalId="root"
                    />
                </div>

                <div className="form-group" ref={inviteSectionRef}>
                    <label>참여자</label>
                    <div className="participant-controls">
                        <div className="invite-add-email" style={{ flexGrow: 1 }}>
                            <IconHashTag strokeColor={emailInput.includes("@") ? "#4f46e5" : "#aaa"}/>
                            <input
                                type="email" 
                                placeholder="이메일로 직접 초대" 
                                value={emailInput} 
                                onChange={(e) => setEmailInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddExternalEmail();
                                    }
                                }}
                            />
                            <button type="button" onClick={handleAddExternalEmail} disabled={!emailInput.includes("@")}>추가</button>
                        </div>
                    </div>
                    <div className="participant-list">
                        {user && <span className="participant-tag self">{user.name} (나)</span>}
                        {participantEmails.map((email) => (
                            <span key={email} className="participant-tag">
                                {email}
                                <button type="button" onClick={() => handleRemoveParticipant(email)}>
                                    &times;
                                </button>
                            </span>
                        ))}
                        <button 
                            type="button" 
                            className="invite-btn" 
                            onClick={() => setInvitePanelOpen(!isInvitePanelOpen)}
                            disabled={busy}
                        >
                            목록에서 선택&nbsp;<IconPlus/>
                        </button>
                    </div>
                </div>

                {
                    
                }

                <div className="form-footer">
                    <div className="ai-toggle">
                        <label htmlFor="ai-summary">AI 요약 사용</label>
                        <label className="switch">
                            <input 
                                id="ai-summary" 
                                type="checkbox" 
                                checked={isAiSummaryOn} 
                                onChange={() => setAiSummaryOn(!isAiSummaryOn)} 
                                disabled={user?.company===null}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <button type="submit" className="create-btn" disabled={busy || meetingName===""}>
                        {busy ? "생성 중..." : "회의 생성하기"}
                    </button>
                </div>

                {error &&
                    <Toast 
                        message={error}
                        onClose={() => setError(null)}
                        type="error"
                    />
                }
                {success &&
                    <Toast 
                        message={success}
                        onClose={() => {setSuccess(null); closeModal(); setBusy(false);}}
                        type="success"
                    />
                }
            </form>
            <AnimatePresence>
                {isInvitePanelOpen && (
                    <InvitePanelDropdown
                        isOpen={isInvitePanelOpen}
                        onClose={() => setInvitePanelOpen(false)}
                        anchorRef={inviteSectionRef}
                        initialInvites={participantEmails}
                        companyMembers={companyMembers}
                        currentUserEmail={user?.email}
                        currentParticipants={participantEmails}
                        onSelectParticipant={handleSelectParticipant}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreateMeetingContent;