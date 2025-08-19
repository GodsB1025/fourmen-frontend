import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-calendar/dist/Calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import "./DocumentsPage.css";

// 경로는 프로젝트 구조에 맞게 조정하세요.
import { fetchDocuments, type DocumentResponse } from "../../../apis/Documents";

export default function DocumentsPage() {
  // 달력 단일 선택
  const [selected, setSelected] = useState<Date>(new Date());

  // 기간 선택 (DatePicker range)
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);

  // 검색어
  const [query, setQuery] = useState("");

  // 데이터 & 로딩
  const [docs, setDocs] = useState<DocumentResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // 조회 기간 계산: 기간 있으면 기간, 없으면 단일 날짜
  const startDate = range[0]
    ? format(range[0], "yyyy-MM-dd")
    : format(selected, "yyyy-MM-dd");
  const endDate = range[1]
    ? format(range[1], "yyyy-MM-dd")
    : format(selected, "yyyy-MM-dd");

  // API 호출
  useEffect(() => {
    setLoading(true);
    fetchDocuments(startDate, endDate)
      .then(setDocs)
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  // 검색 → 첫 매칭 날짜로 이동 (기간 모드 해제)
  const handleSearch = () => {
    if (!docs || !query.trim()) return;
    const lower = query.toLowerCase();

    // meetingsWithDocs 검색
    for (const g of docs.meetingsWithDocs ?? []) {
      for (const m of g.meetings ?? []) {
        if (m.meetingTitle?.toLowerCase().includes(lower)) {
          setSelected(new Date(g.date));
          setRange([null, null]); // 단일 날짜 모드로 전환
          return;
        }
        for (const min of m.minutes ?? []) {
          for (const c of min.contracts ?? []) {
            if (c.title?.toLowerCase().includes(lower)) {
              setSelected(new Date(g.date));
              setRange([null, null]);
              return;
            }
          }
        }
      }
    }

    // 단독 계약서 검색
    for (const c of docs.standaloneContracts ?? []) {
      if (c.title?.toLowerCase().includes(lower)) {
        if (c.createdAt) {
          setSelected(new Date(c.createdAt));
          setRange([null, null]);
        }
        return;
      }
    }
  };

  return (
    <div className="docs-grid">
      {/* 왼쪽: 미니 달력 + 검색 + 기간 선택 */}
      <div className="left-col">
        <div className="mini-cal calendar-compact">
          <Calendar
            value={selected}
            onChange={(d) => {
              setSelected(d as Date);
              // 달력에서 클릭 시 기간 모드 해제
              if (range[0] || range[1]) setRange([null, null]);
            }}
            prev2Label={null}
            next2Label={null}
            showNeighboringMonth={false}
            calendarType="gregory"
            locale="ko-KR"
            formatShortWeekday={() => ""} // 요일 텍스트 제거
            formatDay={(_, date) => format(date, "d")} // 날짜 숫자만
          />
        </div>

        {/* 검색 */}
        <div className="search-wrap">
          <input
            className="search"
            placeholder="회의록 / 문서 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>검색</button>
        </div>

        {/* 기간 선택 */}
        <div className="range-picker">
          <DatePicker
            selectsRange
            startDate={range[0]}
            endDate={range[1]}
            onChange={(update) => setRange(update as [Date | null, Date | null])}
            isClearable
            dateFormat="yyyy-MM-dd"
            placeholderText="기간 선택"
          />
        </div>
      </div>

      {/* 오른쪽: 리스트 */}
      <div className="right-col">
        <h2 className="list-title">
          {range[0] && range[1]
            ? `${format(range[0], "yyyy년 M월 d일")} ~ ${format(
                range[1],
                "yyyy년 M월 d일"
              )}`
            : format(selected, "yyyy년 M월 d일")}
        </h2>

        {loading ? (
          <>
            <div className="skeleton" />
            <div className="skeleton" />
          </>
        ) : !docs ||
          ((docs.meetingsWithDocs?.length ?? 0) === 0 &&
            (docs.standaloneContracts?.length ?? 0) === 0) ? (
          <div className="empty">
            표시할 회의록이 없습니다.
            <div className="empty-sub">
              검색어를 바꾸거나 다른 날짜/기간을 선택해 주세요.
            </div>
          </div>
        ) : (
          <>
            {/* ✅ 회의록 섹션 (단일 날짜: '회의록' 대신 회의 제목을 헤더로) */}
          {(docs.meetingsWithDocs?.length ?? 0) > 0 && (() => {
            const isRangeMode = Boolean(range[0] && range[1]);
            // 날짜 그룹을 평탄화해서 회의 목록만 뽑음
            const meetings = (docs.meetingsWithDocs ?? []).flatMap(g => g.meetings ?? []);
            const first = meetings[0];

            return (
              <section className="group">
                {isRangeMode ? (
                  <h2 className="group-title">회의록</h2>
                ) : (
                  // 단일 날짜 모드: '회의록' 대신 첫 회의 제목을 상단 헤드라인으로
                  first ? <h2 className="meeting-headline">{first.meetingTitle}</h2> : null
                )}

                {meetings.map((m, idx) => {
                  const contracts = (m.minutes ?? []).flatMap(min => min.contracts ?? []);

                  // 단일 날짜 모드 + 첫 회의: 위 헤드라인 바로 아래에 계약서 목록만 노출
                  if (!isRangeMode && idx === 0) {
                    return (
                      <div key={m.meetingId} className="headline-block">
                        {contracts.length > 0 ? (
                          <ul className="files headline-files">
                            {contracts.map(c => <li key={c.contractId}>{c.title}</li>)}
                          </ul>
                        ) : (
                          <div className="no-files headline-files">계약서 없음</div>
                        )}
                      </div>
                    );
                  }

                  // 나머지 회의(또는 기간 모드): 카드 형태로 제목 + 계약서
                  return (
                    <div key={m.meetingId} className="meeting-item">
                      <div className="meeting-title">{m.meetingTitle}</div>
                      {contracts.length > 0 ? (
                        <ul className="files">
                          {contracts.map(c => <li key={c.contractId}>{c.title}</li>)}
                        </ul>
                      ) : (
                        <div className="no-files">계약서 없음</div>
                      )}
                    </div>
                  );
                })}
              </section>
            );
          })()}

            {/* ✅ 계약서 섹션 */}
            {(docs.standaloneContracts?.length ?? 0) > 0 && (
              <section className="group">
                <h2 className="group-title">계약서</h2>
                {(docs.standaloneContracts ?? []).map((c) => (
                  <article key={c.contractId} className="note-card">
                    <div className="title">{c.title}</div>
                    {c.createdAt && (
                      <div className="meta-sub">
                        생성일: {format(new Date(c.createdAt), "yyyy-MM-dd")}
                      </div>
                    )}
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
