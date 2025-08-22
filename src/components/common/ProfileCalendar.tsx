import React, { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import type { DayCellMountArg, DatesSetArg } from "@fullcalendar/core";
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
type ModalState = { open: false; dateStr: "" } | { open: true; dateStr: string };

const OPEN_MODAL_ON_CELL_CLICK = false; // 셀 전체 클릭으로 모달 열지 여부

const pad = (n: number) => String(n).padStart(2, "0");
const addDaysYMD = (ymd: string, n: number) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toLocalMidnightStr = (ymd: string) => `${ymd}T00:00:00`;

const isAllDayEventLike = (ev: any) => {
  if (ev.allDay) return true;
  const s: Date | null = ev.start ?? null;
  const e: Date | null = ev.end ?? null;
  const isMidnight = (d: Date) =>
    d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0;
  if (!s) return false;
  return e ? isMidnight(s) && isMidnight(e) : isMidnight(s);
};

// 회의 일정 판별(FullCalendar EventApi/일반 객체 모두 호환)
const isMeeting = (ev: any) =>
  (ev?.extendedProps?.event_type ?? ev?.event_type) === "meeting";

const BLOCK_MSG = "회의일정은 수정할 수 없습니다.";

function getClickedDateStrFromEventEl(el: HTMLElement, fallbackISO: string) {
  const cell = el.closest<HTMLElement>("td[data-date], .fc-daygrid-day");
  const fromCell = cell?.getAttribute("data-date");
  return fromCell ?? (fallbackISO || "").slice(0, 10);
}

export default function ProfileCalendar({ onMonthChange }: Props) {
  const [modal, setModal] = useState<ModalState>({ open: false, dateStr: "" });
  const calRef = useRef<FullCalendar | null>(null);
  const [modalEvents, setModalEvents] = useState<any[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  const ensureCsrf = async () => {
    try {
      await initCsrf();
    } catch {}
  };
  const refetch = () => calRef.current?.getApi().refetchEvents();

  const fetchEventsForDate = async (dateStr: string) => {
    const list = await fetchCalendar();
    const mapped = list
      .map(mapToEventInput)
      .filter((ev: any) => !ev.__invalid && typeof ev.start === "string");

    const isYmd = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
    const isAllDayByShape = (ev: any) =>
      ev.allDay === true || (typeof ev.start === "string" && isYmd(ev.start));

    return mapped.filter((ev: any) => {
      const sY = (ev.start as string).slice(0, 10);
      let eY = ((ev.end as string) || sY).slice(0, 10);
      if (isAllDayByShape(ev)) eY = addDaysYMD(eY, -1);
      return dateStr >= sY && dateStr <= eY;
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
      setModal({ open: true, dateStr });
    }
  };

  const closeModal = () => {
    setModal({ open: false, dateStr: "" });
    try {
      refetch();
    } catch {}
  };

  // 월/주 전환 완료 시 잠깐 + 숨기기 (깜빡임 방지)
  function handleDatesSet(_info: DatesSetArg) {
    const el = rootRef.current;
    if (!el) return;
    el.classList.add("suppress-add");
    window.setTimeout(() => el.classList.remove("suppress-add"), 200);
  }

  return (
    <div className="profile-cal" ref={rootRef}>
      <FullCalendar
        timeZone="local"
        ref={calRef as any}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locales={[koLocale]}
        locale="ko"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
        height="auto"
        fixedWeekCount={false}
        editable={true}
        dayMaxEvents={2}
        displayEventTime={false}
        allDayMaintainDuration={true}
        forceEventDuration={true}
        nextDayThreshold={"00:00"}
        datesSet={(arg) => {
          handleDatesSet(arg); // 전환 깜빡임 억제
          onMonthChange?.(arg.view.currentStart);
        }}

        /* meeting/personal 스타일 클래스 (가시성용) */
        eventClassNames={(arg) =>
          isMeeting(arg.event) ? ["evt-meeting"] : ["evt-personal"]
        }
        eventDidMount={(info) => {
          const et = info.event.extendedProps?.event_type || "personal";
          info.el.setAttribute("data-etype", et);
          if (et === "meeting") info.el.classList.add("evt-meeting");
          else info.el.classList.add("evt-personal");
        }}

        events={async (_info, success) => {
          try {
            const list = await fetchCalendar();
            const safe = list
              .map(mapToEventInput)
              .filter((ev: any) => !ev.__invalid);
            success(safe as any);
          } catch (e) {
            console.error("FullCalendar events load error:", e);
            success([]);
          }
        }}

        dateClick={(arg) => {
          if (!OPEN_MODAL_ON_CELL_CLICK) return; // 셀 클릭 무시 (토글)
          void openModalFor(arg.dateStr);
        }}

        eventClick={(info) => {
          info.jsEvent.preventDefault();
          info.jsEvent.stopPropagation();
          const dateStr = getClickedDateStrFromEventEl(
            info.el as HTMLElement,
            info.event.startStr
          );
          void openModalFor(dateStr);
        }}

        dayCellDidMount={(arg: DayCellMountArg) => {
          // 이벤트가 없으면 클래스 마킹(디자인용)
          if (arg.el.querySelectorAll(".fc-daygrid-event").length === 0) {
            arg.el.classList.add("fc-day-no-events");
          }

          // ✅ 실제 + 버튼 주입: 프레임 안쪽 기준으로 좌상단 고정
          const frame = arg.el.querySelector(".fc-daygrid-day-frame") as HTMLElement | null;
          const host = frame ?? (arg.el as HTMLElement);
          host.style.position = "relative";

          // 중복 생성 방지
          if (host.querySelector(".fc-add-btn")) return;

          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "fc-add-btn";
          btn.title = "일정 추가";
          btn.textContent = "+";
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation(); // 셀 클릭 전파 차단
            const ymd = toYMD(arg.date);
            void openModalFor(ymd);
          });

          host.appendChild(btn);
        }}

        /* ⬇️ 드래그/리사이즈는 시도는 허용하고, drop/resize 이후에 차단/되돌림 */
        eventDrop={async (info) => {
          if (isMeeting(info.event)) {
            info.revert();
            alert(BLOCK_MSG);
            return;
          }
          try {
            await ensureCsrf();
            if (isAllDayEventLike(info.event)) {
              const startYmd = toYMD(info.event.start!);
              const endYmdExcl = info.event.end
                ? toYMD(info.event.end)
                : addDaysYMD(startYmd, 1);
              await updateCalendarEvent(String(info.event.id), {
                start: toLocalMidnightStr(startYmd),
                end: toLocalMidnightStr(endYmdExcl),
              });
            } else {
              await updateCalendarEvent(String(info.event.id), {
                start: info.event.start?.toISOString() ?? null,
                end: info.event.end?.toISOString() ?? null,
              });
            }
            refetch();
            broadcastCalendarUpdated();
          } catch {
            alert("일정 이동 중 오류 발생");
            info.revert();
          }
        }}

        eventResize={async (info) => {
          if (isMeeting(info.event)) {
            info.revert();
            alert(BLOCK_MSG);
            return;
          }
          try {
            await ensureCsrf();
            if (isAllDayEventLike(info.event)) {
              const startYmd = toYMD(info.event.start!);
              const endYmdExcl = info.event.end
                ? toYMD(info.event.end)
                : addDaysYMD(startYmd, 1);
              await updateCalendarEvent(String(info.event.id), {
                start: toLocalMidnightStr(startYmd),
                end: toLocalMidnightStr(endYmdExcl),
              });
            } else {
              await updateCalendarEvent(String(info.event.id), {
                start: info.event.start?.toISOString() ?? null,
                end: info.event.end?.toISOString() ?? null,
              });
            }
            refetch();
            broadcastCalendarUpdated();
          } catch {
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
              <button className="cal-x" onClick={closeModal} aria-label="닫기">
                ×
              </button>
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
                    try {
                      refetch();
                    } catch {}
                  }
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
              <button className="cal-btn" onClick={closeModal}>
                닫기
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- 생성 폼 -------------------- */
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
  const toLocalMidnight = (ymd: string) => `${ymd}T00:00:00`;

  const handleSubmit = async () => {
    if (!title.trim() || busy) return;
    if (endDate < startDate) {
      alert("종료 날짜가 시작보다 빠를 수 없습니다.");
      return;
    }
    if (!allDay && startDate === endDate && endHM <= startHM) {
      alert("종료 시간이 시작보다 빨라야 합니다.");
      return;
    }

    const startIso = allDay ? toLocalMidnight(startDate) : toIso(startDate, startHM);
    const endIso = allDay ? toLocalMidnight(addDaysYMD(endDate, 1)) : toIso(endDate, endHM);

    setBusy(true);
    try {
      await onCreated({ title: title.trim(), startIso, endIso });
      setTitle("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cal-create">
      <div className="cal-create-row">
        <label>제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 기업 미팅"
        />
      </div>

      <div className="cal-create-row" style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ minWidth: 64 }}>시작</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="time" value={startHM} onChange={(e) => setStartHM(e.target.value)} disabled={allDay} />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ minWidth: 64 }}>종료</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <input type="time" value={endHM} onChange={(e) => setEndHM(e.target.value)} disabled={allDay} />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "8px" }}>
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} /> 종일
        </label>
      </div>

      <button
        className="cal-btn cal-primary"
        onClick={handleSubmit}
        disabled={busy || !title.trim()}
        style={{ marginTop: "1rem", width: "100%" }}
      >
        추가
      </button>
    </div>
  );
}

/* -------------------- 모달 목록 -------------------- */
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

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startHM, setStartHM] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endHM, setEndHM] = useState("10:00");
  const [allDay, setAllDay] = useState(false);

  const toIso = (ymd: string, hm: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    const [hh, mm] = hm.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm, 0, 0).toISOString();
  };
  const toLocalMidnight = (ymd: string) => `${ymd}T00:00:00`;
  const toLocalPieces = (isoOrYmd: string) => {
    const d =
      isoOrYmd.length === 10 ? new Date(`${isoOrYmd}T00:00:00`) : new Date(isoOrYmd);
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return { date: `${y}-${m}-${dd}`, hm: `${hh}:${mi}` };
  };
  const detectAllDay = (startIso: string, endIso?: string) => {
    const s = new Date(startIso.length === 10 ? `${startIso}T00:00:00` : startIso);
    const e = new Date((endIso ?? startIso).length === 10 ? `${endIso}T00:00:00` : (endIso ?? startIso));
    return (
      s.getHours() === 0 && s.getMinutes() === 0 &&
      e.getHours() === 0 && e.getMinutes() === 0 &&
      e.getTime() > s.getTime()
    );
  };

  // ⬇️ meeting도 편집 화면은 열 수 있게 허용 (저장 시 차단)
  const beginEdit = (ev: any) => {
    setEditingId(String(ev.id));
    setTitle(ev.title || "");
    const sp = toLocalPieces(ev.start);
    const ep = toLocalPieces(ev.end ?? ev.start);
    setStartDate(sp.date);
    setStartHM(sp.hm);
    setEndDate(ep.date);
    setEndHM(ep.hm);
    setAllDay(detectAllDay(ev.start, ev.end));
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (ev: any) => {
    if (!title.trim()) return;

    if (endDate < startDate) {
      alert("종료 날짜가 시작보다 빠를 수 없습니다.");
      return;
    }
    if (!allDay && startDate === endDate && endHM <= startHM) {
      alert("종료 시간이 시작보다 빨라야 합니다.");
      return;
    }

    // ⬅️ 여기서 meeting이면 저장 시도 후 차단
    if ((ev?.extendedProps?.event_type ?? ev?.event_type) === "meeting") {
      alert(BLOCK_MSG);
      return;
    }

    const nextStartIso = allDay ? toLocalMidnight(startDate) : toIso(startDate, startHM);
    const nextEndIso = allDay ? toLocalMidnight(addDaysYMD(endDate, 1)) : toIso(endDate, endHM);

    const patch: { title?: string; start?: string; end?: string } = {};
    if (title.trim() !== ev.title) patch.title = title.trim();
    if (nextStartIso !== ev.start) patch.start = nextStartIso;
    if ((ev.end ?? ev.start) !== nextEndIso) patch.end = nextEndIso;

    if (Object.keys(patch).length === 0) {
      setEditingId(null);
      return;
    }
    await onEdit(String(ev.id), patch);
    setEditingId(null);
  };

  if (!Array.isArray(items) || items.length === 0) {
    return <div className="cal-empty">이 날짜에 등록된 일정이 없습니다.</div>;
  }

  return (
    <ul className="cal-list">
      {items.map((ev) => {
        const isEdit = editingId === String(ev.id);
        const meeting = (ev?.extendedProps?.event_type ?? ev?.event_type) === "meeting";
        return (
          <li key={ev.id} className="cal-list-item">
            {isEdit ? (
              <div className="cal-create" style={{ width: "100%" }}>
                <div className="cal-create-row">
                  <label>제목</label>
                  <input
                    type="text"
                    className="cal-title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="cal-create-row" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <label style={{ minWidth: 40 }}>시작</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <input type="time" value={startHM} onChange={(e) => setStartHM(e.target.value)} disabled={allDay} />
                </div>
                <div className="cal-create-row" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <label style={{ minWidth: 40 }}>종료</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  <input type="time" value={endHM} onChange={(e) => setEndHM(e.target.value)} disabled={allDay} />
                </div>

                <label className="cal-create-row" style={{ alignItems: "center", gap: 8, flexDirection: "row" }}>
                  <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
                  종일
                </label>

                <div className="cal-actions" style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button className="cal-btn" onClick={cancelEdit}>취소</button>
                  <button className="cal-btn cal-primary" onClick={() => saveEdit(ev)}>저장</button>
                </div>
              </div>
            ) : (
              <>
                <span className="cal-title">
                  {ev.title || "(제목 없음)"} {meeting && <span className="cal-badge-meeting">회의</span>}
                </span>
                <div className="cal-actions">
                  {/* meeting도 수정 버튼은 활성화: 저장 시점에 차단 */}
                  <button className="cal-btn" onClick={() => beginEdit(ev)} title="수정">
                    수정
                  </button>
                  <button className="cal-btn cal-danger" onClick={() => onDelete(ev.id)}>
                    삭제
                  </button>
                </div>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
