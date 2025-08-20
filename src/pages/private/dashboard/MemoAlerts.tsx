import React, { useEffect, useRef, useState } from "react";
import { fetchCalendarSimple } from "../../../apis/Calendar";
import { CALENDAR_UPDATED_EVENT } from "../../../utils/calendarBus";
import "./MemoAlerts.css";

type Props = {
  /** 오늘로부터 N일 후까지 스캔 (기본 14일) */
  daysWindow?: number;
  /** 최대 몇 줄 표시 (기본 4줄) */
  maxLines?: number;
  /** 자동 새로고침 주기(ms). 0이면 끔 (기본 60000 = 1분) */
  refreshMs?: number;
  /** 시작 N분 전에 데스크톱 알림 (0이면 끔) */
  notifyMinutes?: number;
};

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function diffInDays(a: Date, b: Date) {
  const ms = startOfLocalDay(a).getTime() - startOfLocalDay(b).getTime();
  return Math.round(ms / 86400000);
}
function minutesUntil(d: Date, now = new Date()) {
  return Math.round((d.getTime() - now.getTime()) / 60000);
}

export default function MemoAlerts({
  daysWindow = 14,
  maxLines = 4,
  refreshMs = 0,
  notifyMinutes = 0,
}: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const notified = useRef<Set<string>>(new Set()); // 같은 이벤트 중복 알림 방지

  async function refreshOnce() {
    setLoading(true);

    let events = await fetchCalendarSimple().catch(() => []);
    const now = new Date();
    const today0 = startOfLocalDay(now);
    const until = new Date(today0);
    until.setDate(until.getDate() + daysWindow);

    // 오늘~N일 후 범위로 필터 (진행 중 포함)
    const inRange = events.filter((e) => {
      const s = new Date(e.start);
      const eend = e.end ? new Date(e.end) : s;
      return eend >= today0 && s <= until;
    });

    // 🔔 임박 알림 (옵션)
    if (notifyMinutes > 0 && typeof window !== "undefined" && "Notification" in window) {
      try {
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
        if (Notification.permission === "granted") {
          for (const ev of inRange) {
            const s = new Date(ev.start);
            const m = minutesUntil(s, now);
            if (m >= 0 && m <= notifyMinutes && !notified.current.has(ev.id)) {
              notified.current.add(ev.id);
              new Notification("일정 시작 임박", {
                body: `${ev.title} · ${m}분 후 시작`,
                tag: `ev-${ev.id}`,
              });
            }
          }
        }
      } catch {
        // 알림 권한/표시 에러는 무시
      }
    }

    // 문구 생성
    const buckets: Record<number, string[]> = {};
    for (const ev of inRange) {
      const s = new Date(ev.start);
      const e = ev.end ? new Date(ev.end) : s;
      const ongoing = now >= s && now <= e;
      const d = ongoing ? 0 : Math.max(0, diffInDays(s, today0));
      buckets[d] ??= [];
      buckets[d].push(ongoing ? `${ev.title} (진행 중)` : ev.title);
    }

    const diffs = Object.keys(buckets).map(Number).sort((a, b) => a - b);
    const msgs =
      diffs.length === 0
        ? ["다가오는 일정이 없습니다."]
        : diffs.map((d) => {
            const titles = buckets[d];
            const label = d === 0 ? "오늘" : d === 1 ? "내일" : `${d}일 후`;
            const text =
              titles.length <= 2 ? titles.join(", ") : `${titles[0]} 외 ${titles.length - 1}건`;
            return `${label} ${text} 일정이 있습니다.`;
          });

    setLines(msgs.slice(0, maxLines));
    setLoading(false);
  }

  useEffect(() => {
    let t: any;

    // 최초 1회
    refreshOnce();

    // 🔁 주기 갱신
    if (refreshMs > 0) t = setInterval(refreshOnce, refreshMs);

    // 🧭 탭 활성화 시 갱신
    const onVis = () => {
      if (document.visibilityState === "visible") refreshOnce();
    };
    document.addEventListener("visibilitychange", onVis);

    // 🪟 다른 탭/창에서 캘린더 변경 시 갱신
    const onStorage = (e: StorageEvent) => {
      if (e.key === "calendarUpdatedAt") refreshOnce();
    };
    window.addEventListener("storage", onStorage);

    // 🛰 같은 탭(컴포넌트)에서 캘린더 변경 브로드캐스트 수신
    const onBus = () => refreshOnce();
    window.addEventListener(CALENDAR_UPDATED_EVENT, onBus as EventListener);

    return () => {
      if (t) clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CALENDAR_UPDATED_EVENT, onBus as EventListener);
    };
  }, [daysWindow, maxLines, refreshMs, notifyMinutes]);

  if (loading) return <div className="memo-box">불러오는 중…</div>;
  return (
    <div className="memo-box">
      {lines.map((t, i) => (
        <p key={i} className="memo-line">• {t}</p>
      ))}
    </div>
  );
}
