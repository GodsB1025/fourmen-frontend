import React, { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import {
  fetchCalendar,
  mapToEventInput,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "../../apis/Calendar";
import { initCsrf } from "../../apis/Client";
import { broadcastCalendarUpdated } from "../../utils/calendarBus";
import "./ProfileCalendar.css";

type Props = { onMonthChange?: (date: Date) => void };
type ModalState = { open: boolean; dateStr: string };

const pad = (n: number) => String(n).padStart(2, "0");
const addDaysYMD = (ymd: string, n: number) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

// 클릭한 이벤트 바가 놓인 날짜 셀을 찾아 YYYY-MM-DD 추출
function getClickedDateStrFromEventEl(el: HTMLElement, fallbackISO: string) {
  const cell = el.closest<HTMLElement>('td[data-date], .fc-daygrid-day');
  const fromCell = cell?.getAttribute('data-date');
  return fromCell ?? (fallbackISO || "").slice(0, 10);
}

export default function ProfileCalendar({ onMonthChange }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false, dateStr: "" });
  const calRef = useRef<FullCalendar | null>(null);

  const [modalEvents, setModalEvents] = useState<any[]>([]);

  const ensureCsrf = async () => { try { await initCsrf(); } catch {} };
  const refetch = () => calRef.current?.getApi().refetchEvents();

  /** 특정 날짜 일정 조회 (서버 권위값, 널 안전) */
  const fetchEventsForDate = async (dateStr: string) => {
    const list = await fetchCalendar(); // 항상 배열 보장
    const mapped = list
      .map(mapToEventInput)
      .filter((ev: any) => !ev.__invalid && typeof ev.start === "string");

    return mapped.filter((ev: any) => {
      const s = (ev.start as string).slice(0, 10);
      const e = (ev.end ? (ev.end as string) : s).slice(0, 10);
      return dateStr >= s && dateStr <= e;
    });
  };

  const openModalFor = async (dateStr: string) => {
    try {
      const events = await fetchEventsForDate(dateStr);
      setModalEvents(events);
    } catch (e) {
      console.warn("모달 일정 불러오기 실패:", e);
      setModalEvents([]);
    } finally {
      setSelected(dateStr);
      setModal({ open: true, dateStr });
    }
  };

  const closeModal = () => {
    setModal({ open: false, dateStr: "" });
    try { refetch(); } catch {}
  };

  // 커스텀 네비게이션
  const gotoPrev = () => calRef.current?.getApi().prev();
  const gotoNext = () => calRef.current?.getApi().next();
  const gotoToday = () => calRef.current?.getApi().today();

  return (
    <div className="profile-cal">
      {/* 네비게이션 바 */}
      <div className="cal-toolbar" aria-label="calendar navigation">
        <button className="cal-nav-btn" onClick={gotoPrev} aria-label="이전달">◀ 이전달</button>
        <button className="cal-nav-btn" onClick={gotoToday} aria-label="오늘로 이동">오늘</button>
        <button className="cal-nav-btn" onClick={gotoNext} aria-label="다음달">다음달 ▶</button>
      </div>

      <FullCalendar
        timeZone="local"
        ref={calRef as any}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locales={[koLocale]}
        locale="ko"
        headerToolbar={false as any}
        height="auto"
        fixedWeekCount={false}
        firstDay={0}
        selectable={false}
        editable={true}
        dayMaxEventRows={2}
        displayEventTime={false}
        datesSet={(arg) => {
          setSelected(null);
          onMonthChange?.(arg.view.currentStart);
        }}
        events={async (_info, success, _failure) => {
          try {
            const list = await fetchCalendar(); // 배열 보장
            const safe = list.map(mapToEventInput).filter((ev: any) => !ev.__invalid);
            success(safe as any);
          } catch (e) {
            console.error("FullCalendar events load error:", e);
            success([]);
          }
        }}
        dateClick={(arg) => setSelected(arg.dateStr)}
        dayCellClassNames={(arg) => (arg.dateStr === selected ? ["is-selected"] : [])}
        dayCellDidMount={(arg) => {
          const frame =
            (arg.el.querySelector(".fc-daygrid-day-frame") as HTMLElement) ||
            (arg.el as HTMLElement);
          const btn = document.createElement("button");
          btn.className = "day-add-btn";
          btn.type = "button";
          btn.title = "일정 추가/관리";
          btn.textContent = "+";
          btn.onclick = (e) => {
            e.stopPropagation();
            const dateStr =
              (arg.el.getAttribute("data-date") as string) ||
              `${arg.date.getFullYear()}-${pad(arg.date.getMonth() + 1)}-${pad(arg.date.getDate())}`;
            openModalFor(dateStr);
          };
          frame.appendChild(btn);
        }}
        // 이벤트 바 클릭 → 해당 날짜 모달 열기
        eventClick={(info) => {
          info.jsEvent?.preventDefault();
          info.jsEvent?.stopPropagation();
          const dateStr = getClickedDateStrFromEventEl(info.el as HTMLElement, info.event.startStr);
          openModalFor(dateStr);
        }}
        // 드래그로 날짜/시간 이동
        eventDrop={async (info) => {
          try {
            await ensureCsrf();
            await updateCalendarEvent(String(info.event.id), {
              start: info.event.start?.toISOString() ?? null,
              end: info.event.end?.toISOString() ?? null,
            });
            refetch();
            broadcastCalendarUpdated();
          } catch (error) {
            alert("일정 이동 중 오류 발생");
            info.revert();
          }
        }}
        // 길이 변경(리사이즈)
        eventResize={async (info) => {
          try {
            await ensureCsrf();
            await updateCalendarEvent(String(info.event.id), {
              start: info.event.start?.toISOString() ?? null,
              end: info.event.end?.toISOString() ?? null,
            });
            refetch();
            broadcastCalendarUpdated();
          } catch (error) {
            alert("일정 기간 변경 중 오류 발생");
            info.revert();
          }
        }}
      />

      {modal.open && (
        <div className="cal-modal">
          <div className="cal-backdrop" onClick={closeModal} />
          <div className="cal-dialog" role="dialog" aria-modal="true">
            <header className="cal-dialog-head">
              <div className="cal-dialog-title">{modal.dateStr} 일정</div>
              <button className="cal-x" onClick={closeModal} aria-label="닫기">×</button>
            </header>
            <section className="cal-dialog-body">
              <CreateForm
                dateStr={modal.dateStr}
                onCreated={async ({ title, startIso, endIso }) => {
                  try {
                    await ensureCsrf();
                    await addCalendarEvent({ title, start: startIso, end: endIso });
                  } catch (error: any) {
                    console.error("일정 추가 실패:", error?.response || error);
                    alert("일정 추가에 실패했습니다.");
                    return;
                  } finally {
                    try { refetch(); } catch {}
                  }
                  // 모달 내 목록 갱신
                  try {
                    const updated = await fetchEventsForDate(modal.dateStr);
                    setModalEvents(updated);
                    broadcastCalendarUpdated();
                  } catch (e) {
                    console.warn("일정은 추가되었으나 목록 갱신 실패:", e);
                  }
                }}
              />
              <EventList
                key={modal.dateStr}
                items={modalEvents}
                onEdit={async (id, patch) => {
                  try {
                    await ensureCsrf();
                    await updateCalendarEvent(String(id), patch);
                    const updated = await fetchEventsForDate(modal.dateStr);
                    setModalEvents(updated);
                    refetch();
                    broadcastCalendarUpdated();
                  } catch {
                    alert("일정 수정 중 오류 발생");
                  }
                }}
                onDelete={async (id) => {
                  try {
                    await ensureCsrf();
                    await deleteCalendarEvent(String(id));
                    const updated = await fetchEventsForDate(modal.dateStr);
                    setModalEvents(updated);
                    refetch();
                    broadcastCalendarUpdated();
                  } catch {
                    alert("삭제 중 오류 발생");
                  }
                }}
              />
            </section>
            <footer className="cal-dialog-foot">
              <button className="cal-btn" onClick={closeModal}>닫기</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== 생성 폼 ===== */
function CreateForm({
  dateStr,
  onCreated,
}: {
  dateStr: string;
  onCreated: (payload: { title: string; startIso: string; endIso: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(dateStr);
  const [endDate, setEndDate] = useState(dateStr);
  const [startHM, setStartHM] = useState("09:00");
  const [endHM, setEndHM] = useState("10:00");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStartDate(dateStr);
    setEndDate(dateStr);
    setStartHM("09:00");
    setEndHM("10:00");
    setAllDay(false);
    setTitle("");
  }, [dateStr]);

  const toIso = (ymd: string, hm: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    const [hh, mm] = hm.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm, 0, 0).toISOString();
  };

  const handleSubmit = async () => {
    if (!title.trim() || busy) return;
    if (endDate < startDate) { alert("종료 날짜가 시작보다 빠를 수 없습니다."); return; }
    if (!allDay && startDate === endDate && endHM <= startHM) {
      alert("종료 시간이 시작보다 빨라야 합니다."); return;
    }

    const startIso = allDay ? toIso(startDate, "00:00") : toIso(startDate, startHM);
    const endIso   = allDay ? toIso(addDaysYMD(endDate, 1), "00:00") : toIso(endDate, endHM);

    setBusy(true);
    try {
      await onCreated({ title: title.trim(), startIso, endIso });
      setTitle("");
    } finally { setBusy(false); }
  };

  return (
    <div className="cal-create">
      <div className="cal-create-row">
        <label>제목</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 기업 미팅" />
      </div>

      <div className="cal-create-row" style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <label style={{ minWidth: 64 }}>시작</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="time" value={startHM} onChange={(e) => setStartHM(e.target.value)} disabled={allDay} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <label style={{ minWidth: 64 }}>종료</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <input type="time" value={endHM} onChange={(e) => setEndHM(e.target.value)} disabled={allDay} />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} /> 종일
        </label>
      </div>

      <button className="cal-btn cal-primary" onClick={handleSubmit} disabled={busy || !title.trim()}>
        추가
      </button>
    </div>
  );
}

/* ===== 일정 목록 (제목 + 시간 수정 가능) ===== */
function EventList({
  items,
  onEdit,
  onDelete,
}: {
  items: any[];
  onEdit: (id: string, patch: { title?: string; start?: string; end?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // 편집 필드
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startHM, setStartHM] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endHM, setEndHM] = useState("10:00");
  const [allDay, setAllDay] = useState(false);

  // 유틸
  const toIso = (ymd: string, hm: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    const [hh, mm] = hm.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm, 0, 0).toISOString();
  };
  const toLocalPieces = (iso: string) => {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return { date: `${y}-${m}-${dd}`, hm: `${hh}:${mi}` };
  };
  const detectAllDay = (startIso: string, endIso?: string) => {
    const s = new Date(startIso);
    const e = new Date(endIso ?? startIso);
    return (
      s.getHours() === 0 && s.getMinutes() === 0 &&
      e.getHours() === 0 && e.getMinutes() === 0 &&
      e.getTime() > s.getTime()
    );
  };

  const beginEdit = (ev: any) => {
    setEditingId(String(ev.id));
    setTitle(ev.title || "");
    const sp = toLocalPieces(ev.start);
    const ep = toLocalPieces(ev.end ?? ev.start);
    setStartDate(sp.date); setStartHM(sp.hm);
    setEndDate(ep.date); setEndHM(ep.hm);
    setAllDay(detectAllDay(ev.start, ev.end));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (ev: any) => {
    if (!title.trim()) return;

    if (endDate < startDate) { alert("종료 날짜가 시작보다 빠를 수 없습니다."); return; }
    if (!allDay && startDate === endDate && endHM <= startHM) {
      alert("종료 시간이 시작보다 빨라야 합니다."); return;
    }

    const nextStartIso = allDay ? toIso(startDate, "00:00") : toIso(startDate, startHM);
    const nextEndIso   = allDay ? toIso(addDaysYMD(endDate, 1), "00:00") : toIso(endDate, endHM);

    const patch: { title?: string; start?: string; end?: string } = {};
    if (title.trim() !== ev.title) patch.title = title.trim();
    if (nextStartIso !== ev.start) patch.start = nextStartIso;
    if ((ev.end ?? ev.start) !== nextEndIso) patch.end = nextEndIso;

    if (Object.keys(patch).length === 0) { setEditingId(null); return; }
    await onEdit(String(ev.id), patch);
    setEditingId(null);
  };

  if (!Array.isArray(items) || items.length === 0) {
    return <div className="cal-empty">이 날짜에 일정이 없습니다.</div>;
  }

  return (
    <ul className="cal-list">
      {items.map((ev) => {
        const isEdit = editingId === String(ev.id);
        return (
          <li key={ev.id} className="cal-list-item">
            {isEdit ? (
              <>
                <div className="cal-edit-grid">
                  <div className="cal-edit-row">
                    <label>제목</label>
                    <input
                      className="cal-title-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="cal-edit-row">
                    <label>시작</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <input type="time" value={startHM} onChange={(e) => setStartHM(e.target.value)} disabled={allDay} />
                  </div>

                  <div className="cal-edit-row">
                    <label>종료</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    <input type="time" value={endHM} onChange={(e) => setEndHM(e.target.value)} disabled={allDay} />
                  </div>

                  <label className="cal-edit-row" style={{ alignItems: "center", gap: 8 }}>
                    <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
                    종일
                  </label>
                </div>

                <div className="cal-actions">
                  <button className="cal-btn cal-primary" onClick={() => saveEdit(ev)}>저장</button>
                  <button className="cal-btn" onClick={cancelEdit}>취소</button>
                </div>
              </>
            ) : (
              <>
                <span className="cal-title">{ev.title || "(제목 없음)"}</span>
                <div className="cal-actions">
                  <button className="cal-btn" onClick={() => beginEdit(ev)}>수정</button>
                  <button className="cal-btn cal-danger" onClick={() => onDelete(ev.id)}>삭제</button>
                </div>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
