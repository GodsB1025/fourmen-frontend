import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import Calendar from "react-calendar";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "react-datepicker/dist/react-datepicker.css";
import "react-calendar/dist/Calendar.css";
import "./DocumentsPage.css";

import type { DocumentResponse, MinuteDetail } from "../../../apis/Types";
import { fetchDocuments } from "../../../apis/Documents"
import { getMinuteDetails } from "../../../apis/Meeting";

// --- 아이콘 컴포넌트들 ---
const FolderIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
);
const FileTextIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);
const BriefcaseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
);

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

// --- 회의록 상세 보기 모달 컴포넌트 ---
const MinuteDetailModal = ({ minute, onClose }: { minute: MinuteDetail; onClose: () => void }) => {
    const minuteTypeLabel: Record<string, string> = {
        AUTO: "AI 자동 회의록",
        SELF: "수동 회의록",
        SUMMARY: "AI 요약 회의록",
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{minute.meetingTitle}</h2>
                    <button onClick={onClose} className="modal-close-btn">
                        &times;
                    </button>
                </header>
                <div className="modal-subheader">
                    <span className={`badge type-${minute.type.toLowerCase()}`}>{minuteTypeLabel[minute.type]}</span>
                    <span className="meta">작성자: {minute.authorName}</span>
                    <span className="meta">작성일: {format(new Date(minute.createdAt), "yyyy.MM.dd HH:mm")}</span>
                </div>
                <main className="modal-body markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{minute.content}</ReactMarkdown>
                </main>
            </div>
        </div>
    );
};

export default function DocumentsPage() {
    const baseURL = import.meta.env.VITE_API_BASE_URL as string;
    const [range, setRange] = useState<[Date | null, Date | null]>([daysAgo(30), startOfToday()]);
    const [docs, setDocs] = useState<DocumentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const [viewingMinute, setViewingMinute] = useState<MinuteDetail | null>(null);
    const [isMinuteLoading, setIsMinuteLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleItem = (id: string) => {
        setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleViewMinute = async (meetingId: number, minuteId: number) => {
        setIsMinuteLoading(true);
        try {
            const minuteDetails = await getMinuteDetails(meetingId, minuteId);
            setViewingMinute(minuteDetails);
        } catch (err) {
            alert("회의록을 불러오는 데 실패했습니다.");
        } finally {
            setIsMinuteLoading(false);
        }
    };

    const handleOpenContractPdf = (url: string) => {
        if (!url) return;
        window.open(`${baseURL}${url}.pdf`, "_blank", "noopener,noreferrer");
    };

    const meetingDates = useMemo(() => {
        if (!docs?.meetingsWithDocs) return new Set<string>();
        const dates = new Set<string>();
        docs.meetingsWithDocs.forEach((dailyDocs) => {
            if (dailyDocs.meetings.length > 0) {
                dates.add(dailyDocs.date);
            }
        });
        return dates;
    }, [docs]);

    const filteredDocs = useMemo(() => {
        if (!docs) return null;
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) return docs;

        const filteredMeetingsWithDocs = docs.meetingsWithDocs
            .map((dailyDocs) => {
                const filteredMeetings = dailyDocs.meetings.filter((meeting) => {
                    if (meeting.meetingTitle.toLowerCase().includes(lowercasedQuery)) return true;
                    return meeting.minutes.some(
                        (minute) =>
                            minute.type.toLowerCase().includes(lowercasedQuery) ||
                            minute.contracts.some((contract) => contract.title.toLowerCase().includes(lowercasedQuery))
                    );
                });
                return { ...dailyDocs, meetings: filteredMeetings };
            })
            .filter((dailyDocs) => dailyDocs.meetings.length > 0);

        const filteredStandaloneContracts = docs.standaloneContracts?.filter((contract) => contract.title.toLowerCase().includes(lowercasedQuery));

        return {
            meetingsWithDocs: filteredMeetingsWithDocs,
            standaloneContracts: filteredStandaloneContracts,
        };
    }, [docs, searchQuery]);

    useEffect(() => {
        if (!range[0] || !range[1]) {
            setLoading(false);
            setDocs(null);
            return;
        }
        const startDate = format(range[0], "yyyy-MM-dd");
        const endDate = format(range[1], "yyyy-MM-dd");

        setLoading(true);
        setError(null);
        fetchDocuments(startDate, endDate)
            .then(setDocs)
            .catch(() => setError("문서 목록을 불러오는 데 실패했습니다."))
            .finally(() => setLoading(false));
    }, [range]);

    return (
        <div className="docs-page-layout">
            <aside className="docs-sidebar">
                <h2 className="sidebar-title">문서 필터</h2>

                <div className="filter-group">
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
                            formatDay={(locale, date) => format(date, "d")}
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
                ) : error ? (
                    <div className="docs-empty-state">{error}</div>
                ) : (
                    <>
                        <section className="docs-section">
                            <h2 className="section-title">회의 기반 문서</h2>
                            {filteredDocs?.meetingsWithDocs?.length > 0 ? (
                                filteredDocs.meetingsWithDocs.map((dailyDocs) => (
                                    <div key={dailyDocs.date} className="daily-group">
                                        <h3 className="date-header">{format(new Date(dailyDocs.date), "yyyy년 M월 d일")}</h3>
                                        <div className="accordion">
                                            {dailyDocs.meetings.map((meeting) => (
                                                <div key={meeting.meetingId} className="accordion-item">
                                                    <button className="accordion-header" onClick={() => toggleItem(`m-${meeting.meetingId}`)}>
                                                        <FolderIcon />
                                                        <span>{meeting.meetingTitle}</span>
                                                        <span className="item-count">{meeting.minutes.length}</span>
                                                    </button>
                                                    {openItems[`m-${meeting.meetingId}`] && (
                                                        <div className="accordion-content">
                                                            {meeting.minutes.map((minute) => (
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
                                                                    {minute.contracts.length > 0 && (
                                                                        <div className="accordion-content contract-list">
                                                                            {minute.contracts.map((contract) => (
                                                                                <div
                                                                                    key={contract.contractId}
                                                                                    className="document-leaf clickable"
                                                                                    onClick={() => handleOpenContractPdf(contract.completedPdfUrl)}>
                                                                                    <BriefcaseIcon />
                                                                                    <span>{contract.title}</span>
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
                            {filteredDocs?.standaloneContracts?.length > 0 ? (
                                <div className="standalone-list">
                                    {filteredDocs.standaloneContracts.map((contract) => (
                                        <div
                                            key={contract.contractId}
                                            className="document-leaf standalone clickable"
                                            onClick={() => handleOpenContractPdf(contract.completedPdfUrl)}>
                                            <BriefcaseIcon />
                                            <div className="info">
                                                <span className="title">{contract.title}</span>
                                                <span className="date">{format(new Date(contract.createdAt!), "yyyy.MM.dd")}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="docs-empty-state">표시할 독립 계약서가 없습니다.</div>
                            )}
                        </section>
                    </>
                )}
            </main>

            {(isMinuteLoading || viewingMinute) &&
                (isMinuteLoading ? (
                    <div className="modal-backdrop">
                        <div className="docs-loader">회의록을 불러오는 중...</div>
                    </div>
                ) : (
                    viewingMinute && <MinuteDetailModal minute={viewingMinute} onClose={() => setViewingMinute(null)} />
                ))}
        </div>
    );
}
