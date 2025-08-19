import api from "../apis/Client";

// ------ 응답 표준화: 어떤 형태여도 항상 배열로 반환 ------
function normalizeList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return []; // null/undefined/기타 형태 → 빈 배열
}

// ------ 서버 이벤트 타입(참조용) ------
export type ServerCalendarEvent = {
  id: string | number;
  title: string;
  startTime: string; // ISO8601 with Z
  endTime: string;   // ISO8601 with Z
};

// ------ FullCalendar용 매핑 (널 안전) ------
export function mapToEventInput(ev: any) {
  const start =
    ev.startTime ?? ev.startAt ?? ev.start ?? ev.begin ?? ev.start_date ?? null;
  const end =
    ev.endTime ?? ev.endAt ?? ev.end ?? ev.finish ?? ev.end_date ?? null;

  if (!start) return { __invalid: true }; // start 없으면 렌더 불가

  return {
    id: String(ev.id ?? ev.eventId ?? ev.uid ?? `tmp_${Math.random().toString(36).slice(2)}`),
    title: ev.title ?? ev.name ?? "(제목 없음)",
    start,
    end,
  };
}

// ------ 목록 조회 (항상 배열 보장) ------
export async function fetchCalendar(): Promise<any[]> {
  const res = await api.get("/calendar").catch((e) => {
    console.error("fetchCalendar error:", e?.response || e);
    return { data: [] };
  });
  return normalizeList(res?.data);
}

// ------ 생성 ------
export async function addCalendarEvent(input: {
  title: string;
  start: string; // toISOString()
  end: string;   // toISOString()
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

// ------ 부분 수정 (있는 필드만 보냄) ------
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

// ------ 삭제 ------
export async function deleteCalendarEvent(id: string) {
  return api.delete(`/calendar/${id}`);
}

/* =========================
   🔽 추가된 헬퍼 (메모알림에서 사용)
   ========================= */

// 메모알림에서 쓰기 좋은 얇은 타입
export type FCEv = {
  id: string;
  title: string;
  start: string; // ISO
  end?: string;  // ISO
};

// GET /calendar 결과 → mapToEventInput → __invalid 제거 후 간단 타입으로 변환
export async function fetchCalendarSimple(): Promise<FCEv[]> {
  const raw = await fetchCalendar();
  return raw
    .map(mapToEventInput)
    .filter((e: any) => !e.__invalid)
    .map((e: any) => ({ id: e.id, title: e.title, start: e.start, end: e.end }));
}
