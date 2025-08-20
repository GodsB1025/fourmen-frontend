import { useState, useEffect, useMemo } from "react";
import Calendar from "react-calendar";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-calendar/dist/Calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import "./DocumentsPage.css";

// 경로는 프로젝트 구조에 맞게 조정하세요.
import { fetchDocuments, type DocumentResponse } from "../../../apis/Documents";

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
  // 달력 단일 선택
  const [selected, setSelected] = useState<Date>(new Date());

  // 기간 선택 (DatePicker range)
  const [range, setRange] = useState<[Date | null, Date | null]>([daysAgo(7),startOfToday(),]);

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

  // meetingsWithDocs → (회의 배열) 평탄화(+원본 날짜 포함)
  const flatMeetings = useMemo(
    () =>
      (docs?.meetingsWithDocs ?? []).flatMap((g) =>
        (g.meetings ?? []).map((m) => ({ ...m, _groupDate: g.date }))
      ),
    [docs]
  );

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

  const isRangeMode = Boolean(range[0] && range[1]);

  return (
    <div className="docs-grid">
      {/* 왼쪽: 미니 달력 + 검색 + 기간 선택 */}
      <div className="left-col">
        <div className="mini-cal calendar-compact">
          <Calendar
            value={selected}
            onChange={(d) => {
              setSelected(d as Date);
              if (range[0] || range[1]) setRange([null, null]); // 달력 클릭 시 기간 모드 해제
            }}
            prev2Label={null}
            next2Label={null}
            showNeighboringMonth={false}
            calendarType="gregory"
            locale="ko-KR"
            formatShortWeekday={() => ""}                  // 요일 텍스트 제거
            formatDay={(_, date) => format(date, "d")}     // 날짜 숫자만
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

      {/* 오른쪽: 넓은 카드 안에 — 날짜 헤더 → 회의 섹션들(제목+불릿) → 계약서 섹션(제목 라인) */}
      <div className="right-col">
        <h2 className="list-title">
          {isRangeMode
            ? `${format(range[0]!, "yyyy년 M월 d일")} ~ ${format(range[1]!, "yyyy년 M월 d일")}`
            : format(selected, "yyyy년 M월 d일")}
        </h2>

        {loading ? (
          <>
            <div className="skeleton" /><div className="skeleton" />
          </>
        ) : !docs || (flatMeetings.length === 0 && (docs.standaloneContracts?.length ?? 0) === 0) ? (
          <div className="empty">
            표시할 회의록이 없습니다.
            <div className="empty-sub">검색어를 바꾸거나 다른 날짜/기간을 선택해 주세요.</div>
          </div>
        ) : (
          <>
            {/* ✅ 회의 섹션: 탭 없이 ‘제목이 위로’ 올라오는 형태로 스택 */}
            {flatMeetings.length > 0 && (
              <section className="meeting-section-stack">
                {flatMeetings.map((m, idx) => {
                  const contracts = (m.minutes ?? []).flatMap((min: any) => min.contracts ?? []);
                  return (
                    <article key={m.meetingId ?? `mt-${idx}`} className="meeting-section">
                      {/* 회의 제목 (회의록 자리를 대체) */}
                      <h3 className="meeting-title-line">
                        {m.meetingTitle}
                        {isRangeMode && m._groupDate && (
                          <span className="title-chip">
                            {format(new Date(m._groupDate), "yyyy-MM-dd")}
                          </span>
                        )}
                      </h3>

                      {/* 관련 계약서 - 불릿 */}
                      {contracts.length > 0 ? (
                        <ul className="bullet-list">
                          {contracts.map((c: any) => (
                            <li key={c.contractId}>{c.title}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="no-files-inline">계약서 없음</div>
                      )}
                    </article>
                  );
                })}
              </section>
            )}

            {/* ✅ 계약서 섹션도 회의 섹션과 동일한 룩앤필 (제목이 위, 칩 메타, 스택) */}
            {(docs?.standaloneContracts?.length ?? 0) > 0 && (
              <section className="group group-contracts">
                <h2 className="group-title">계약서</h2>

                <div className="meeting-section-stack contracts-stack">
                  {(docs!.standaloneContracts!).map((c, idx) => (
                    <article key={c.contractId ?? `ct-${idx}`} className="meeting-section contract-section">
                      <h3 className="meeting-title-line">
                        {c.title}
                        {c.createdAt && (
                          <span className="title-chip">
                            {format(new Date(c.createdAt), "yyyy-MM-dd")}
                          </span>
                        )}
                      </h3>

                      {/* 필요시 추가 메타를 여기로 (예: 회사/담당자 등) */}
                      {/* {c.companyName && <div className="contract-sub">{c.companyName}</div>} */}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
