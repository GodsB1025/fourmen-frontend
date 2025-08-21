import React, { useState, useEffect, useMemo } from "react";
import "./CreateMeetingContent.css";
import { useAuthStore } from "../../stores/authStore";
import { createMeetingRoom } from "../../apis/Meeting";
import type { CreateMeetingRequest } from "../../apis/Types";
import { useModalStore } from "../../stores/modalStore";
import { fetchCompanyMembers, type CompanyMember } from "../../apis/Company";

// --- Helper Functions ---
const getInitialDateTimeLocal = () => {
    const now = new Date();
    const timeZoneOffset = now.getTimezoneOffset() * 60000;
    return new Date(now - timeZoneOffset).toISOString().slice(0, 16);
};

// --- Main Component ---
const CreateMeetingContent = () => {
    const { closeModal } = useModalStore();
    const user = useAuthStore((state) => state.user);

    // --- State Management ---
    const [isInviting, setIsInviting] = useState(false);
    const [meetingName, setMeetingName] = useState("");
    const [scheduledAt, setScheduledAt] = useState(getInitialDateTimeLocal());
    const [isAiSummaryOn, setAiSummaryOn] = useState(true);
    const [participantEmails, setParticipantEmails] = useState<string[]>([]);

    const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
    const [pendingInvites, setPendingInvites] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [emailInput, setEmailInput] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    // --- Effects ---
    useEffect(() => {
        if (user?.company) {
            fetchCompanyMembers()
                .then(setCompanyMembers)
                .catch(() => console.error("회사 멤버 목록을 불러오지 못했습니다."));
        }
    }, [user]);

    // --- Memoized Values ---
    const companyMembersToShow = useMemo(() => {
        if (!isInviting) return [];
        const lowercasedQuery = searchQuery.toLowerCase();

        return companyMembers.filter(
            (member) =>
                member.email !== user?.email &&
                !pendingInvites.has(member.email) &&
                (member.name.toLowerCase().includes(lowercasedQuery) || member.email.toLowerCase().includes(lowercasedQuery))
        );
    }, [searchQuery, companyMembers, pendingInvites, isInviting, user]);

    // --- Event Handlers ---
    const handleRemoveParticipant = (emailToRemove: string) => {
        setParticipantEmails((emails) => emails.filter((email) => email !== emailToRemove));
    };

    const handleTogglePendingInvite = (email: string) => {
        setPendingInvites((prev) => {
            const newSelection = new Set(prev);
            if (newSelection.has(email)) {
                newSelection.delete(email);
            } else {
                newSelection.add(email);
            }
            return newSelection;
        });
    };

    const handleAddExternalEmail = () => {
        if (emailInput && emailInput.includes("@")) {
            handleTogglePendingInvite(emailInput);
            setEmailInput("");
        }
    };

    const handleOpenInvitePanel = () => {
        setPendingInvites(new Set(participantEmails));
        setIsInviting(true);
    };

    const handleConfirmInvites = () => {
        setParticipantEmails(Array.from(pendingInvites));
        setIsInviting(false);
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
            const scheduledAtISO = new Date(scheduledAt).toISOString();
            const payload: CreateMeetingRequest = {
                title: meetingName.trim(),
                scheduledAt: scheduledAtISO,
                useAiMinutes: isAiSummaryOn,
                participantEmails,
            };

            await createMeetingRoom(payload);
            alert("회의가 성공적으로 생성되었습니다!");
            closeModal();
        } catch (err: any) {
            setError(err.message || "회의 생성 중 오류가 발생했습니다.");
        } finally {
            setBusy(false);
        }
    };

    // --- Render Logic ---
    return (
        <div className="create-meeting-container">
            <div className={`panel-wrapper ${isInviting ? "show-invite-panel" : ""}`}>
                {/* Panel 1: Main Form */}
                <form className="panel main-form-panel" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="meeting-name">회의 이름</label>
                        <input
                            id="meeting-name"
                            type="text"
                            placeholder="예: 3분기 실적 리뷰"
                            value={meetingName}
                            onChange={(e) => setMeetingName(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="meeting-time">회의 시간</label>
                        <input
                            id="meeting-time"
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>참여자</label>
                        <div className="participant-controls">
                            <button type="button" className="invite-btn" onClick={handleOpenInvitePanel}>
                                초대하기
                            </button>
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
                        </div>
                    </div>

                    <div className="form-footer">
                        <div className="ai-toggle">
                            <label htmlFor="ai-summary">AI 요약 사용</label>
                            <label className="switch">
                                <input id="ai-summary" type="checkbox" checked={isAiSummaryOn} onChange={() => setAiSummaryOn(!isAiSummaryOn)} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <button type="submit" className="create-btn" disabled={busy}>
                            {busy ? "생성 중..." : "회의 생성하기"}
                        </button>
                    </div>

                    {error && <p className="form-error-msg">{error}</p>}
                </form>

                {/* Panel 2: Invite Panel */}
                <div className="panel invite-panel">
                    <div className="invite-header">
                        <h3>참여자 초대</h3>
                    </div>

                    <div className="invite-add-email">
                        <input
                            type="email"
                            placeholder="이메일 주소로 직접 초대"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddExternalEmail())}
                        />
                        <button type="button" onClick={handleAddExternalEmail} disabled={!emailInput.includes("@")}>
                            추가
                        </button>
                    </div>

                    {companyMembers.length > 0 && (
                        <div className="company-member-section">
                            <div className="invite-search">
                                <input
                                    type="text"
                                    placeholder="팀원 이름 또는 이메일로 검색"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <ul className="member-list">
                                {companyMembersToShow.map((member) => (
                                    <li key={member.id} className="member-item" onClick={() => handleTogglePendingInvite(member.email)}>
                                        <div className="member-info">
                                            <span className="member-name">{member.name}</span>
                                            <span className="member-email">{member.email}</span>
                                        </div>
                                        <span className="add-indicator">+</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="pending-invites-section">
                        <h4>초대할 사람 ({pendingInvites.size}명)</h4>
                        <div className="pending-list">
                            {Array.from(pendingInvites).map((email) => (
                                <span key={email} className="participant-tag">
                                    {email}
                                    <button type="button" onClick={() => handleTogglePendingInvite(email)}>
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="invite-footer">
                        <button type="button" onClick={() => setIsInviting(false)} className="btn-secondary">
                            취소
                        </button>
                        <button type="button" onClick={handleConfirmInvites} className="btn-primary">
                            완료
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateMeetingContent;
