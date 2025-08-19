import api from "../apis/Client";
export type CalendarEventDTO = any;

const stripNil = (o: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== null) out[k] = v;
  return out;
};
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const addDays = (ymd: string, n: number) => {
  const [y,m,dd] = ymd.split("-").map(Number);
  return toYMD(new Date(y, m-1, dd + n));
};

const pickArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  const container = data?.items ?? data?.content ?? data?.events ?? data?.result ?? data?.data;
  if (container === null || container === undefined) return [];
  return Array.isArray(container) ? container : [container];
};

export function mapToEventInput(x: CalendarEventDTO) {
  if (!x) return { id: undefined, title: "(잘못된 데이터)" };

  // --- ✨ id 후보군 보강 (personalEventId 포함) ---
  const rawId =
    x.id ?? x.eventId ?? x.personalEventId ?? x.uuid ?? x.calendarId ?? x.scheduleId ?? x.seq ?? x.key;
  const id = rawId != null ? String(rawId) : undefined;

  const rawStart =
    x.startTime ?? x.start_time ?? x.startAt ?? x.startDateTime ?? x.startDate ?? x.start ?? x.beginAt ?? x.date;
  const rawEnd =
    x.endTime ?? x.end_time ?? x.endAt ?? x.endDateTime ?? x.endDate ?? x.end ?? x.finishAt ?? undefined;

  const title = x.title ?? x.name ?? x.subject ?? "(제목 없음)";
  if (!rawStart) return { id, title, extendedProps: x };

  const ymd = (v: any) => (typeof v === "string" && v.length >= 10 ? v.slice(0,10) : toYMD(new Date(v)));
  const sY = ymd(rawStart);
  const eY = rawEnd ? ymd(rawEnd) : undefined;

  const hms = (v: any) => {
    const s = typeof v === "string" ? v : new Date(v).toISOString();
    return { hh: +s.slice(11,13) || 0, mm: +s.slice(14,16) || 0, ss: +s.slice(17,19) || 0 };
  };
  const sH = hms(rawStart);
  const eH = rawEnd ? hms(rawEnd) : undefined;

  // --- ✨ 로컬 자정 판정 추가 (UTC 자정뿐 아니라 현지 자정도 인정) ---
  const startDateObj = new Date(rawStart);
  const endDateObj = rawEnd ? new Date(rawEnd) : undefined;
  const isMidnightLocal = (d: Date) => d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0;

  const startMidnight = sH.hh === 0 && sH.mm === 0 && sH.ss === 0;
  const endOfDay      = !!eH && eH.hh === 23 && eH.mm === 59 && eH.ss >= 59;
  const nextDay00     = !!eH && eH.hh === 0  && eH.mm === 0  && eH.ss === 0 && eY !== sY;

  const startLocalMidnight = isMidnightLocal(startDateObj);
  const endLocalMidnight   = !!endDateObj && isMidnightLocal(endDateObj);

  // --- 종일(allDay) 취급: UTC 자정 or 로컬 자정 ---
  if ((startMidnight || startLocalMidnight) && (!rawEnd || endOfDay || nextDay00 || endLocalMidnight)) {
    return {
      id, title,
      start: sY,
      end: rawEnd ? (endOfDay ? addDays(eY!, 1) : eY) : addDays(sY, 1),
      allDay: true,
      extendedProps: x,
    };
  }

  // 같은 이벤트라도 날짜가 넘어가면 바 형태로 묶기
  if (rawEnd && eY !== sY) {
    return {
      id, title,
      start: sY,
      end: addDays(eY!, 1),
      allDay: true,
      extendedProps: { ...x, _barFromTimed: true },
    };
  }

  return { id, title, start: rawStart, ...(rawEnd ? { end: rawEnd } : {}), extendedProps: x };
}

/** ===== 조회: 파라미터 없이 전체 가져오기 (서버 정책에 맞춤) ===== */
export async function fetchCalendar(params?: { start?: string; end?: string }) {
  const { data } = await api.get("/calendar");
  return pickArray(data.data);
}

/** ===== 생성 ===== */
export async function addCalendarEvent(body: {
  title: string;
  start: string;       // ISO(UTC Z) 문자열
  end?: string;        // ISO(UTC Z) 문자열
  eventType?: string;  // 없으면 PERSONAL 기본
}) {
  const payload = stripNil({
    title: body.title,
    startTime: body.start,
    endTime: body.end,
    eventType: body.eventType ?? "PERSONAL",
  });
  const { data } = await api.post("/calendar/add", payload);

  // --- ✨ 응답 래핑 다양성 대응 ---
  const created = (data && (data.data ?? data.result)) ?? data;
  return created;
}

/** ===== 수정 ===== */
export async function updateCalendarEvent(
  eventId: string,
  patch: Partial<{ title: string; start: string; end: string; eventType: string }>
) {
  const payload = stripNil({
    title: patch.title,
    startTime: patch.start,
    endTime: patch.end,
    eventType: patch.eventType,
  });
  const { data } = await api.patch(`/calendar/${eventId}`, payload);
  // 유연 파싱(서버 응답이 단일 객체면 그대로 반환)
  return (data && (data.data ?? data.result)) ?? data;
}

/** ===== 삭제 ===== */
export async function deleteCalendarEvent(eventId: string) {
  const { data } = await api.delete(`/calendar/${eventId}`);
  return (data && (data.data ?? data.result)) ?? data;
}

/** ===== 오늘 ===== */
export async function fetchToday() {
  const { data } = await api.get("/calendar/today");
  return (data && (data.data ?? data.result)) ?? data;
}
