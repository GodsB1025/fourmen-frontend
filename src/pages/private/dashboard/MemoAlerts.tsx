import React, { useEffect, useState } from "react";
import { fetchCalendarSimple } from "../../../apis/Calendar";
import "./MemoAlerts.css";

type Props = {
  /** 오늘로부터 몇 일 후까지 검색할지 (기본 14일) */
  daysWindow?: number;
  /** 최대 몇 줄까지 보여줄지 (기본 4줄) */
  maxLines?: number;
};

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function diffInDays(a: Date, b: Date) {
  const ms = startOfLocalDay(a).getTime() - startOfLocalDay(b).getTime();
  return Math.round(ms / 86400000);
}

export default function MemoAlerts({ daysWindow = 14, maxLines = 4 }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let events = await fetchCalendarSimple().catch(() => []);

      const now = new Date();
      const today0 = startOfLocalDay(now);
      const until = new Date(today0);
      until.setDate(until.getDate() + daysWindow);

      // 오늘~N일 후 범위만 포함 (진행 중 포함)
      const inRange = events.filter((e) => {
        const s = new Date(e.start);
        const eend = e.end ? new Date(e.end) : s;
        return eend >= today0 && s <= until;
      });

      // 날짜차이로 버킷 (진행중은 0일로)
      const buckets: Record<number, string[]> = {};
      for (const ev of inRange) {
        const s = new Date(ev.start);
        const e = ev.end ? new Date(ev.end) : s;
        const ongoing = now >= s && now <= e;
        const d = ongoing ? 0 : Math.max(0, diffInDays(s, today0));
        buckets[d] ??= [];
        buckets[d].push(ongoing ? `${ev.title} (진행 중)` : ev.title);
      }

      // 문구 생성
      const diffs = Object.keys(buckets).map(Number).sort((a, b) => a - b);
      const msgs: string[] = [];
      for (const d of diffs) {
        const titles = buckets[d];
        const label = d === 0 ? "오늘" : d === 1 ? "내일" : `${d}일 후`;
        const text =
          titles.length <= 2 ? titles.join(", ") : `${titles[0]} 외 ${titles.length - 1}건`;
        msgs.push(`${label} ${text} 일정이 있습니다.`);
      }
      if (msgs.length === 0) msgs.push("다가오는 일정이 없습니다.");

      setLines(msgs.slice(0, maxLines));
      setLoading(false);
    })();
  }, [daysWindow, maxLines]);

  if (loading) return <div className="memo-box">불러오는 중…</div>;
  return (
    <div className="memo-box">
      {lines.map((t, i) => (
        <p key={i} className="memo-line">• {t}</p>
      ))}
    </div>
  );
}
