import api from "../apis/Client";

/* ---------- 목록 정규화 ---------- */
function normalizeList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

export type ServerCalendarEvent = {
  id: string | number;
  title: string;
  startTime: string; // 서버 UTC ISO 또는 로컬
  endTime: string;   // 서버 UTC ISO 또는 로컬
};

const pad = (n: number) => String(n).padStart(2, "0");

// ISO(UTC든 로컬이든) → 로컬 기준 YYYY-MM-DD
const toYmdLocal = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// YYYY-MM-DD ± n일
const addDaysYMD = (ymd: string, n: number) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

// "자정" 패턴(문자열)인지 검사: T00:00:00(.sss)?(Z)?
const isZeroClockIsoStr = (s?: string) =>
  !!s && /T00:00:00(?:\.\d{3})?(?:Z)?$/.test(s);

// "종일로 의도된 값" 추정:
// - start/end가 자정 표기이고
// - end가 없거나 start==end(미보정)거나 / 기간이 24h 배수
const looksAllDayFromIso = (start?: string, end?: string) => {
  if (!start) return false;
  if (!isZeroClockIsoStr(start)) return false;
  if (!end) return true;
  if (!isZeroClockIsoStr(end)) return false;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return ms === 0 || ms % 86400000 === 0;
};

/* ---------- FullCalendar EventInput 변환 ---------- */
export function mapToEventInput(ev: any) {
  const start =
    ev.startTime ?? ev.startAt ?? ev.start ?? ev.begin ?? ev.start_date ?? null;
  const end =
    ev.endTime ?? ev.endAt ?? ev.end ?? ev.finish ?? ev.end_date ?? null;

  if (!start) return { __invalid: true }; // start 없으면 렌더 불가

  // ✅ READ 정규화: 종일로 보이면 날짜문자열 + 배타적 end로 변환
  if (looksAllDayFromIso(start, end)) {
    const sY = toYmdLocal(start);
    let eY = end ? toYmdLocal(end) : sY;
    if (eY === sY) eY = addDaysYMD(sY, 1); // start==end 교정
    return {
      id: String(ev.id ?? ev.eventId ?? ev.uid ?? `tmp_${Math.random().toString(36).slice(2)}`),
      title: ev.title ?? ev.name ?? "(제목 없음)",
      start: sY,           // 'YYYY-MM-DD'
      end: eY,             // 'YYYY-MM-DD' (배타적)
      allDay: true,        // 종일
    };
  }

  // 일반 timed 이벤트는 그대로
  return {
    id: String(ev.id ?? ev.eventId ?? ev.uid ?? `tmp_${Math.random().toString(36).slice(2)}`),
    title: ev.title ?? ev.name ?? "(제목 없음)",
    start,
    end,
  };
}

/* ---------- API 호출 ---------- */
export async function fetchCalendar(): Promise<any[]> {
  const res = await api.get("/calendar").catch((e) => {
    console.error("fetchCalendar error:", e?.response || e);
    return { data: [] };
  });
  return normalizeList(res?.data);
}

// 생성: 시간형은 ISO(Z), 종일은 'YYYY-MM-DDT00:00:00' (로컬, Z 없음)
export async function addCalendarEvent(input: {
  title: string;
  start: string; // timed: ISO(Z), all-day: 'YYYY-MM-DDT00:00:00'
  end: string;   // timed: ISO(Z), all-day: 'YYYY-MM-DDT00:00:00' (배타적)
}) {
  const body = {
    title: input.title.trim(),
    startTime: input.start,
    endTime: input.end,
  };
  return api.post("/calendar/add", body, {
    headers: { "Content-Type": "application/json" },
  });
}

// 부분 수정
export async function updateCalendarEvent(
  id: string,
  patch: { title?: string; start?: string | null | undefined; end?: string | null | undefined }
) {
  const body: Record<string, any> = {};
  if (patch.title !== undefined) body.title = patch.title?.trim() ?? "";
  if (patch.start !== undefined) body.startTime = patch.start;
  if (patch.end !== undefined) body.endTime = patch.end;

  return api.patch(`/calendar/${id}`, body, {
    headers: { "Content-Type": "application/json" },
  });
}

// 삭제
export async function deleteCalendarEvent(id: string) {
  return api.delete(`/calendar/${id}`);
}

/* ---------- 메모알림용 얇은 타입 ---------- */
export type FCEv = {
  id: string;
  title: string;
  start: string; // ISO 또는 'YYYY-MM-DD'
  end?: string;  // ISO 또는 'YYYY-MM-DD'
};

export async function fetchCalendarSimple(): Promise<FCEv[]> {
  const raw = await fetchCalendar();
  return raw
    .map(mapToEventInput)
    .filter((e: any) => !e.__invalid)
    .map((e: any) => ({ id: e.id, title: e.title, start: e.start, end: e.end }));
}
