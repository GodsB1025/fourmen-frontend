import api from "../apis/Client";
import type { TodayEvent } from "./Types";

/* ---------- 목록 정규화 ---------- */
function normalizeList(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.content)) return data.content;
    return [];
}

export type ServerCalendarEvent = {
    id?: string | number;
    eventId?: string | number;
    uid?: string | number;
    title?: string;
    name?: string;
    startTime?: string;
    endTime?: string;
    startAt?: string;
    endAt?: string;
    start?: string;
    end?: string;
    begin?: string;
    finish?: string;
    start_date?: string;
    end_date?: string;
    eventType?: string; // e.g. "MEETING"
    event_type?: string; // e.g. "meeting"
    type?: string; // fallback
};

const pad = (n: number) => String(n).padStart(2, "0");

// ISO → 로컬 YYYY-MM-DD
const toYmdLocal = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// YYYY-MM-DD ± n
const addDaysYMD = (ymd: string, n: number) => {
    const [y, m, d] = ymd.split("-").map(Number);
    const dt = new Date(y, m - 1, d + n);
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

// "T00:00:00(.sss)?(Z)?" 패턴
const isZeroClockIsoStr = (s?: string) => !!s && /T00:00:00(?:\.\d{3})?(?:Z)?$/.test(s);

// 종일 의도 추정
const looksAllDayFromIso = (start?: string, end?: string) => {
    if (!start) return false;
    if (!isZeroClockIsoStr(start)) return false;
    if (!end) return true;
    if (!isZeroClockIsoStr(end)) return false;
    const ms = new Date(end).getTime() - new Date(start).getTime();
    return ms === 0 || ms % 86400000 === 0;
};

// ★ event_type 통일(대문자 포함 모두 소문자로)
const resolveEventType = (ev: Partial<ServerCalendarEvent>): string => {
    const raw = ev.event_type ?? ev.eventType ?? ev.type ?? "personal";
    return String(raw).toLowerCase(); // "MEETING" -> "meeting"
};

/* ---------- FullCalendar EventInput 변환 ---------- */
export function mapToEventInput(ev: any) {
    const start = ev.startTime ?? ev.startAt ?? ev.start ?? ev.begin ?? ev.start_date ?? null;
    const end = ev.endTime ?? ev.endAt ?? ev.end ?? ev.finish ?? ev.end_date ?? null;

    if (!start) return { __invalid: true };

    const id = String(ev.id ?? ev.eventId ?? ev.uid ?? `tmp_${Math.random().toString(36).slice(2)}`);
    const title = ev.title ?? ev.name ?? "(제목 없음)";
    const event_type = resolveEventType(ev);

    const base = {
        id,
        title,
        extendedProps: { event_type },
        // 스타일이 반드시 적용되도록 classNames도 함께 주입
        classNames: [event_type === "meeting" ? "evt-meeting" : "evt-personal"],
    };

    if (looksAllDayFromIso(start, end)) {
        const sY = toYmdLocal(start);
        let eY = end ? toYmdLocal(end) : sY;
        if (eY === sY) eY = addDaysYMD(sY, 1); // 배타적 끝
        return { ...base, start: sY, end: eY, allDay: true };
    }

    return { ...base, start, end };
}

/* ---------- API 호출 ---------- */
export async function fetchCalendar(): Promise<any[]> {
    try {
        const res = await api.get("/calendar");
        return normalizeList(res?.data);
    } catch (error) {
        // 에러를 콘솔에 기록하되, 여기서 처리하지 않고 다시 throw하여
        // 이 함수를 호출한 컴포넌트가 에러 발생을 인지하도록 합니다.
        console.error("fetchCalendar error:", error);
        throw error;
    }
}

export async function getTodayEvents(): Promise<TodayEvent[]> {
    try {
        const { data } = await api.get("/calendar/today");
        return data.data;
    } catch (error) {
        console.error("오늘의 일정을 불러오는데 실패했습니다:", error);
        return [];
    }
}

// 생성: 시간형은 ISO(Z), 종일은 'YYYY-MM-DDT00:00:00'
export async function addCalendarEvent(input: { title: string; start: string; end: string }) {
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
export async function updateCalendarEvent(id: string, patch: { title?: string; start?: string | null | undefined; end?: string | null | undefined }) {
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
    end?: string; // ISO 또는 'YYYY-MM-DD'
};

export async function fetchCalendarSimple(): Promise<FCEv[]> {
    const raw = await fetchCalendar();
    return raw
        .map(mapToEventInput)
        .filter((e: any) => !e.__invalid)
        .map((e: any) => ({ id: e.id, title: e.title, start: e.start, end: e.end }));
}
