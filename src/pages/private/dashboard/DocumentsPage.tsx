import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import Calendar from "react-calendar";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "react-datepicker/dist/react-datepicker.css";
import "react-calendar/dist/Calendar.css";
import "./DocumentsPage.css";

import type { DocumentResponse, MinuteDetail, SharedMinuteResponse, CompanyMember } from "../../../apis/Types";
import { fetchDocuments, fetchSharedMinutes } from "../../../apis/Documents";
import { getMinuteDetails, shareMinute } from "../../../apis/Meeting";
import { fetchCompanyMembers } from "../../../apis/Company";
import CustomSwitch from "../../../components/common/CustomSwitch";
import { useAuthStore } from "../../../stores/authStore";
import { FolderIcon, FileTextIcon, BriefcaseIcon, ShareIcon } from "../../../assets/icons"; // 아이콘 import 추가
import Toast from "../../../components/common/Toast";

// --- 날짜 헬퍼 함수 ---
const startOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};
const daysAgo = (n: number) => {
    const d = startOfToday();
    d.setDate(d.getDate() - n);
    return d;
};

// --- 계약서 상태 뱃지 컴포넌트 ---
const ContractStatusBadge = ({ status }: { status: "SENT" | "COMPLETED" }) => {
    if (!status) return null;

    const isCompleted = status === "COMPLETED";
    const badgeClass = isCompleted ? "status-badge completed" : "status-badge sent";
    const text = isCompleted ? "완료" : "진행중";

    return <span className={badgeClass}>{text}</span>;
};

// --- 회의록 공유 모달 ---
const ShareMinuteModal = ({
    onClose,
    onShare,
    setError,
    setInfo,
}: {
    minute: MinuteDetail;
    onClose: () => void;
    onShare: (userIds: number[]) => Promise<void>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    setInfo: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
    const [members, setMembers] = useState<CompanyMember[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchCompanyMembers()
            .then((data) => {
                setMembers(data.filter((m) => m.id !== user?.userId));
            })
            .catch(() => setError("회사 멤버 목록을 불러오는데 실패했습니다."))
            .finally(() => setLoading(false));
    }, [user]);

    const handleSelectMember = (memberId: number) => {
        setSelectedMembers((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(memberId)) {
                newSet.delete(memberId);
            } else {
                newSet.add(memberId);
            }
            return newSet;
        });
    };

    const handleShare = async () => {
        if (selectedMembers.size === 0) {
            setInfo("공유할 멤버를 선택해주세요.");
            return;
        }
        await onShare(Array.from(selectedMembers));
    };

    return (
        <div className="document-modal-backdrop" onClick={onClose}>
            <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="document-modal-header">
                    <h2>회의록 공유</h2>
                    <button onClick={onClose} className="document-modal-close-btn">
                        &times;
                    </button>
                </header>
                <main className="share-modal-body">
                    {loading ? (
                        <p>멤버 목록 로딩 중...</p>
                    ) : (
                        <ul className="member-list">
                            {members.map((member) => (
                                <li
                                    key={member.id}
                                    className={`member-item ${selectedMembers.has(member.id) ? "selected" : ""}`}
                                    onClick={() => handleSelectMember(member.id)}>
                                    <input type="checkbox" checked={selectedMembers.has(member.id)} readOnly />
                                    <div className="member-info">
                                        <span className="member-name">{member.name}</span>
                                        <span className="member-email">{member.email}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </main>
                <footer className="share-modal-footer">
                    {/* ✅ '취소' 버튼에 .cancel-btn 클래스 적용 */}
                    <button onClick={onClose} className="cancel-btn">
                        취소
                    </button>
                    <button onClick={handleShare} className="btn-primary" disabled={selectedMembers.size === 0}>
                        공유하기
                    </button>
                </footer>
            </div>
        </div>
    );
};

// --- 회의록 상세 보기 모달 컴포넌트 ---
const MinuteDetailModal = ({
    minute,
    onClose,
    showShareButton,
    onOpenShare,
}: {
    minute: MinuteDetail;
    onClose: () => void;
    showShareButton: boolean;
    onOpenShare: () => void;
}) => {
    const minuteTypeLabel: Record<string, string> = {
        AUTO: "AI 자동 회의록",
        SELF: "수동 회의록",
        SUMMARY: "AI 요약 회의록",
    };

    return (
        <div className="document-modal-backdrop" onClick={onClose}>
            <div className="document-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="document-modal-header">
                    <h2>{minute.meetingTitle}</h2>
                    <button onClick={onClose} className="document-modal-close-btn">
                        &times;
                    </button>
                </header>
                <div className="document-modal-subheader">
                    <span className={`badge type-${minute.type!.toLowerCase()}`}>{minuteTypeLabel[minute.type!]}</span>
                    <span className="meta">작성자: {minute.authorName}</span>
                    <span className="meta">작성일: {format(new Date(minute.createdAt), "yyyy.MM.dd HH:mm")}</span>
                </div>
                <main className="document-modal-body markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{minute.content}</ReactMarkdown>
                </main>
                {/* showShareButton prop에 따라 공유 버튼을 조건부로 렌더링 */}
                {showShareButton && (
                    <footer className="document-modal-footer">
                        <button onClick={onOpenShare} className="share-button">
                            <ShareIcon /> 공유하기
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default function DocumentsPage() {
    const baseURL = import.meta.env.VITE_API_BASE_URL as string;
    const [activeTab, setActiveTab] = useState("my");
    const [range, setRange] = useState<[Date | null, Date | null]>([daysAgo(30), startOfToday()]);
    const [docs, setDocs] = useState<DocumentResponse | null>(null);
    const [sharedMinutes, setSharedMinutes] = useState<SharedMinuteResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const [viewingMinute, setViewingMinute] = useState<MinuteDetail | null>(null);
    const [isMinuteLoading, setIsMinuteLoading] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const tabOptions = [
        { value: "my", label: "내 문서" },
        { value: "shared", label: "공유받은 문서" },
    ];

    const toggleItem = (id: string) => {
        setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleViewMinute = async (meetingId: number, minuteId: number) => {
        setIsMinuteLoading(true);
        try {
            const minuteDetails = await getMinuteDetails(String(meetingId), minuteId);
            setViewingMinute(minuteDetails);
        } catch (err : unknown) {
            let errorMessage = "회의록을 불러오는 데 실패했습니다.";
            if(err instanceof Error) errorMessage += `: ${err.message}`
            setError(errorMessage);
        } finally {
            setIsMinuteLoading(false);
        }
    };

    const handleShareMinute = async (userIds: number[]) => {
        if (!viewingMinute) return;
        try {
            await shareMinute(viewingMinute.meetingId!, viewingMinute.minuteId, userIds);
            setSuccess("성공적으로 공유되었습니다.");
            setIsShareModalOpen(false);
        } catch (error: unknown) {
            let errorMessage = "공유에 실패했습니다."
            if(error instanceof Error) errorMessage += `: ${error.message}`
            setError(errorMessage);
        }
    };

    const handleOpenContractPdf = (url: string) => {
        if (!url) return;
        window.open(`${baseURL}${url}.pdf`, "_blank", "noopener,noreferrer");
    };

    const meetingDates = useMemo(() => {
        if (activeTab !== "my" || !docs?.meetingsWithDocs) return new Set<string>();
        const dates = new Set<string>();
        docs.meetingsWithDocs.forEach((dailyDocs) => {
            if (dailyDocs.meetings.length > 0) {
                dates.add(dailyDocs.date);
            }
        });
        return dates;
    }, [docs, activeTab]);

    const filteredDocs = useMemo(() => {
        if (activeTab !== "my" || !docs) return null;
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) return docs;

        if (docs.meetingsWithDocs) {
            const filteredMeetingsWithDocs = docs.meetingsWithDocs
                .map((dailyDocs) => {
                    const filteredMeetings = dailyDocs.meetings.filter((meeting) => {
                        if (meeting.meetingTitle.toLowerCase().includes(lowercasedQuery)) return true;
                        return meeting.minutes?.some(
                            (minute) =>
                                minute.type.toLowerCase().includes(lowercasedQuery) ||
                                minute.contracts?.some((contract) => contract.title.toLowerCase().includes(lowercasedQuery))
                        );
                    });
                    return { ...dailyDocs, meetings: filteredMeetings };
                })
                .filter((dailyDocs) => dailyDocs.meetings.length > 0);

            const filteredStandaloneContracts = docs.standaloneContracts?.filter((contract) =>
                contract.title.toLowerCase().includes(lowercasedQuery)
            );

            return {
                meetingsWithDocs: filteredMeetingsWithDocs,
                standaloneContracts: filteredStandaloneContracts,
            };
        }
    }, [docs, searchQuery, activeTab]);

    const filteredSharedMinutes = useMemo(() => {
        if (activeTab !== "shared") return [];
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) return sharedMinutes;
        return sharedMinutes.filter(
            (minute) => minute.meetingTitle.toLowerCase().includes(lowercasedQuery) || minute.authorName.toLowerCase().includes(lowercasedQuery)
        );
    }, [sharedMinutes, searchQuery, activeTab]);

    useEffect(() => {
        setLoading(true);
        setError(null);

        if (activeTab === "my") {
            if (!range[0] || !range[1]) {
                setLoading(false);
                setDocs(null);
                return;
            }
            const startDate = format(range[0], "yyyy-MM-dd");
            const endDate = format(range[1], "yyyy-MM-dd");
            fetchDocuments(startDate, endDate)
                .then(setDocs)
                .catch(() => setError("문서 목록을 불러오는 데 실패했습니다."))
                .finally(() => setLoading(false));
        } else {
            fetchSharedMinutes()
                .then(setSharedMinutes)
                .catch(() => setError("공유받은 문서 목록을 불러오는 데 실패했습니다."))
                .finally(() => setLoading(false));
        }
    }, [range, activeTab]);

    return (
        <div className="docs-page-layout">
            <aside className="docs-sidebar">
                <h2 className="sidebar-title">문서함</h2>
                <div className="filter-group tab-group">
                    <CustomSwitch options={tabOptions} value={activeTab} onChange={setActiveTab} />
                </div>
                {activeTab === "my" && (
                    <>
                        <div className="filter-group datepicker-group">
                            <label>조회 기간</label>
                            <DatePicker
                                selectsRange
                                startDate={range[0]}
                                endDate={range[1]}
                                onChange={(update) => setRange(update as [Date | null, Date | null])}
                                dateFormat="yyyy.MM.dd"
                                className="datepicker-input"
                                isClearable
                                placeholderText="기간을 선택하세요"
                            />
                        </div>

                        <div className="filter-group">
                            <label>날짜 선택</label>
                            <div className="calendar-container">
                                <Calendar
                                    locale="ko"
                                    onChange={(date) => {
                                        if (date instanceof Date) setRange([date, date]);
                                    }}
                                    formatDay={(_locale, date) => format(date, "d")}
                                    tileContent={({ date, view }) => {
                                        const ymd = format(date, "yyyy-MM-dd");
                                        if (view === "month" && meetingDates.has(ymd)) {
                                            return <div className="meeting-dot"></div>;
                                        }
                                        return null;
                                    }}
                                />
                            </div>
                        </div>
                    </>
                )}
                <div className="filter-group">
                    <label>검색</label>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="제목, 유형으로 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            </aside>
            <main className="docs-content">
                {loading ? (
                    <div className="docs-loader">불러오는 중...</div>
                ) : activeTab === "my" ? (
                    <>
                        <section className="docs-section">
                            <h2 className="section-title">회의 기반 문서</h2>
                            {(filteredDocs?.meetingsWithDocs?.length ?? 0) > 0 ? (
                                (filteredDocs?.meetingsWithDocs ?? []).map((dailyDocs) => (
                                    <div key={dailyDocs.date} className="daily-group">
                                        <h3 className="date-header">{format(new Date(dailyDocs.date), "yyyy년 M월 d일")}</h3>
                                        <div className="accordion">
                                            {dailyDocs.meetings.map((meeting) => (
                                                <div key={meeting.meetingId} className="accordion-item">
                                                    <button className="accordion-header" onClick={() => toggleItem(`m-${meeting.meetingId}`)}>
                                                        <FolderIcon />
                                                        <span>{meeting.meetingTitle}</span>
                                                        <span className="item-count">{meeting.minutes?.length || 0}</span>
                                                    </button>
                                                    {openItems[`m-${meeting.meetingId}`] && (
                                                        <div className="accordion-content">
                                                            {meeting.minutes?.map((minute) => (
                                                                <div key={minute.minuteId} className="accordion-sub-item">
                                                                    <button
                                                                        className="accordion-header sub-header"
                                                                        onClick={() => handleViewMinute(meeting.meetingId, minute.minuteId)}>
                                                                        <FileTextIcon />
                                                                        <span>
                                                                            {minute.type === "AUTO"
                                                                                ? "AI 회의록"
                                                                                : minute.type === "SELF"
                                                                                ? "수동 회의록"
                                                                                : "AI 요약"}
                                                                        </span>
                                                                    </button>
                                                                    {(minute.contracts?.length ?? 0) > 0 && (
                                                                        <div className="accordion-content contract-list">
                                                                            {(minute.contracts ?? []).map((contract) => (
                                                                                <div
                                                                                    key={contract.contractId}
                                                                                    className="document-leaf clickable"
                                                                                    onClick={() => handleOpenContractPdf(contract.completedPdfUrl)}>
                                                                                    <BriefcaseIcon />
                                                                                    <span>{contract.title}</span>
                                                                                    {/* 상태 뱃지 추가 */}
                                                                                    <ContractStatusBadge status={contract.status} />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="docs-empty-state">표시할 문서가 없습니다.</div>
                            )}
                        </section>
                        <section className="docs-section">
                            <h2 className="section-title">기타 계약서</h2>
                            {filteredDocs?.standaloneContracts?.length ?? 0 > 0 ? (
                                <div className="standalone-list">
                                    {(filteredDocs?.standaloneContracts ?? []).map((contract) => (
                                        <div
                                            key={contract.contractId}
                                            className="document-leaf standalone clickable"
                                            onClick={() => handleOpenContractPdf(contract.completedPdfUrl)}>
                                            <BriefcaseIcon />
                                            <div className="info">
                                                <span className="title">{contract.title}</span>
                                                <span className="date">{format(new Date(contract.createdAt!), "yyyy.MM.dd")}</span>
                                            </div>
                                            {/* 상태 뱃지 추가 */}
                                            <ContractStatusBadge status={contract.status} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="docs-empty-state">표시할 독립 계약서가 없습니다.</div>
                            )}
                        </section>
                    </>
                ) : (
                    // ✅ 공유받은 문서 탭 렌더링 로직
                    <section className="docs-section">
                        <h2 className="section-title">공유받은 회의록</h2>
                        {filteredSharedMinutes.length > 0 ? (
                            <div className="accordion">
                                {filteredSharedMinutes.map((minute) => (
                                    <div key={minute.minuteId} className="accordion-item">
                                        <button className="accordion-header" onClick={() => toggleItem(`s-${minute.minuteId}`)}>
                                            <FolderIcon />
                                            <span>{minute.meetingTitle}</span>
                                            <span className="item-count">{minute.contracts?.length || 0}</span>
                                        </button>
                                        {openItems[`s-${minute.minuteId}`] && (
                                            <div className="accordion-content">
                                                <div className="accordion-sub-item">
                                                    <button
                                                        className="accordion-header sub-header"
                                                        onClick={() => handleViewMinute(minute.meetingId, minute.minuteId)}>
                                                        <FileTextIcon />
                                                        <span>회의록 보기 (공유자: {minute.authorName})</span>
                                                    </button>
                                                </div>
                                                {minute.contracts?.length > 0 && (
                                                    <div className="accordion-content contract-list">
                                                        {minute.contracts.map((contract) => (
                                                            <div
                                                                key={contract.contractId}
                                                                className="document-leaf clickable"
                                                                onClick={() => handleOpenContractPdf(contract.completedPdfUrl)}>
                                                                <BriefcaseIcon />
                                                                <span>{contract.title}</span>
                                                                {/* 상태 뱃지 추가 */}
                                                                <ContractStatusBadge status={contract.status} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="docs-empty-state">공유받은 회의록이 없습니다.</div>
                        )}
                    </section>
                )}
            </main>
            {isMinuteLoading && (
                <div className="modal-backdrop">
                    <div className="docs-loader">회의록을 불러오는 중...</div>
                </div>
            )}
            {viewingMinute && !isShareModalOpen && (
                <MinuteDetailModal
                    minute={viewingMinute}
                    onClose={() => setViewingMinute(null)}
                    showShareButton={activeTab === "my"}
                    onOpenShare={() => setIsShareModalOpen(true)}
                />
            )}
            {viewingMinute && isShareModalOpen && (
                <ShareMinuteModal 
                    minute={viewingMinute} 
                    onClose={() => setIsShareModalOpen(false)} 
                    onShare={handleShareMinute} 
                    setError={setError}
                    setInfo={setInfo}
                />
            )}
            { error &&
                <Toast 
                    message={error}
                    onClose={() => setError(null)}
                    type="error"
                />
            }
            { info &&
                <Toast 
                    message={info}
                    onClose={() => setInfo(null)}
                    type="info"
                />
            }
            { success &&
                <Toast 
                    message={success}
                    onClose={() => setSuccess(null)}
                    type="success"
                />
            }
        </div>
    );
}