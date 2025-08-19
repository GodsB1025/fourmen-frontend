export const CALENDAR_UPDATED_EVENT = "calendar:updated";

export function broadcastCalendarUpdated() {
  // 같은 탭(컴포넌트) 알림
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent(CALENDAR_UPDATED_EVENT));
    } catch {}
  }
  // 다른 탭/창 알림
  try {
    localStorage.setItem("calendarUpdatedAt", String(Date.now()));
  } catch {}
}