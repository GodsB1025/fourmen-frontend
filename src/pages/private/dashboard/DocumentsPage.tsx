import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import "./DocumentsPage.css"; // 새로운 CSS 파일을 임포트합니다.

import { fetchDocuments, type DocumentResponse, type MeetingDoc, type MinuteDoc, type StandaloneContract } from "../../../apis/Documents";

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

export default function DocumentsPage() {
    const [range, setRange] = useState<[Date | null, Date | null]>([daysAgo(30), startOfToday()]);
    const [docs, setDocs] = useState<DocumentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 열려있는 회의/회의록 아코디언을 추적하기 위한 state
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    const toggleItem = (id: string) => {
        setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    useEffect(() => {
        if (!range[0] || !range[1]) return;

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
            {/* 왼쪽 필터 영역 */}
            <aside className="docs-sidebar">
                <h2 className="sidebar-title">문서 조회</h2>
                <div className="datepicker-container">
                    <label>조회 기간</label>
                    <DatePicker
                        selectsRange
                        startDate={range[0]}
                        endDate={range[1]}
                        onChange={(update) => setRange(update as [Date, Date])}
                        dateFormat="yyyy.MM.dd"
                        className="datepicker-input"
                    />
                </div>
            </aside>

            {/* 오른쪽 콘텐츠 영역 */}
            <main className="docs-content">
                {loading ? (
                    <div className="docs-loader">불러오는 중...</div>
                ) : error ? (
                    <div className="docs-empty-state">{error}</div>
                ) : (
                    <>
                        {/* 회의 기반 문서 섹션 */}
                        <section className="docs-section">
                            <h2 className="section-title">회의 기반 문서</h2>
                            {docs?.meetingsWithDocs && docs.meetingsWithDocs.length > 0 ? (
                                docs.meetingsWithDocs.map((dailyDocs) => (
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
                                                                        onClick={() => toggleItem(`min-${minute.minuteId}`)}>
                                                                        <FileTextIcon />
                                                                        <span>{minute.type === "AUTO" ? "AI 회의록" : "수동 회의록"}</span>
                                                                        <span className="item-count">{minute.contracts.length}</span>
                                                                    </button>
                                                                    {openItems[`min-${minute.minuteId}`] && (
                                                                        <div className="accordion-content">
                                                                            {minute.contracts.length > 0 ? (
                                                                                minute.contracts.map((contract) => (
                                                                                    <div key={contract.contractId} className="document-leaf">
                                                                                        <BriefcaseIcon />
                                                                                        <span>{contract.title}</span>
                                                                                    </div>
                                                                                ))
                                                                            ) : (
                                                                                <div className="no-sub-item">연결된 계약서가 없습니다.</div>
                                                                            )}
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
                                <div className="docs-empty-state">해당 기간에 회의 기반 문서가 없습니다.</div>
                            )}
                        </section>

                        {/* 기타 계약서 섹션 */}
                        <section className="docs-section">
                            <h2 className="section-title">기타 계약서</h2>
                            {docs?.standaloneContracts && docs.standaloneContracts.length > 0 ? (
                                <div className="standalone-list">
                                    {docs.standaloneContracts.map((contract) => (
                                        <div key={contract.contractId} className="document-leaf standalone">
                                            <BriefcaseIcon />
                                            <div className="info">
                                                <span className="title">{contract.title}</span>
                                                <span className="date">{format(new Date(contract.createdAt!), "yyyy.MM.dd")}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="docs-empty-state">해당 기간에 독립된 계약서가 없습니다.</div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
