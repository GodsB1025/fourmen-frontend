import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import "react-calendar/dist/Calendar.css";
import "./DocumentsPage.css";

type DayGroup = { date: string };

export default function DocumentsPage() {
  const [selected, setSelected] = useState<Date>(new Date());
  const [query, setQuery] = useState("");

  const dayGroups: DayGroup[] = useMemo(() => {
    return [];
  }, []);

  return (
    <div className="docs-grid">
      <div className="left-col">
        <div className="mini-cal calendar-compact">
          <Calendar
            value={selected}
            onChange={(d) => setSelected(d as Date)}
            prev2Label={null}
            next2Label={null}
            showNeighboringMonth={false}
            calendarType="gregory"
            locale="ko-KR"
            formatShortWeekday={() => ""}         // 요일 헤더 제거
            formatDay={(locale, date) =>          // 숫자만 출력
              format(date, "d")
            }
          />
        </div>

        <input
          className="search"
          placeholder="회의록 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        
      </div>

      <div className="right-col">
        <h2 className="list-title">{format(selected, "yyyy년 M월 d일")}</h2>

        {dayGroups.length === 0 ? (
          <div className="empty">
            표시할 회의록이 없습니다.
            <div className="empty-sub">검색어를 바꾸거나 다른 날짜를 선택해 주세요.</div>
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : (
          dayGroups.map((g) => (
            <section key={g.date} className="day-group">
              <h3>{format(new Date(g.date), "yyyy년 M월 d일")}</h3>
              <hr />
              <article className="note-card">
                <div className="meta">
                  <div className="label">회의록</div>
                  <div className="room">회의실 이름 : -</div>
                </div>
                <div className="title">회의록 요약</div>
                <ul className="files">
                  <li>계약서 1</li>
                  <li>계약서 2</li>
                </ul>
              </article>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
