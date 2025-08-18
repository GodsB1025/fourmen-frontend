import React, { useState } from 'react';
import ProfileCalendar from '../../../components/common/ProfileCalendar';
import "./Dashboard.css";
import { useAuthStore } from '../../../stores/authStore';

type Props = {};

const ProfilePage = (props: Props) => {
  const storeUser = useAuthStore((s) => s.user);
  const raw = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
  const localUser = raw ? JSON.parse(raw) : null;
  const user = storeUser ?? localUser;

  const company =
    user?.companyName ??
    user?.company?.name ??
    (typeof user?.company === "string" ? user.company : "") ??
    "";

  // 달력이 월 이동할 때 타이틀 갱신
  const [monthLabel, setMonthLabel] = useState<string>(`${new Date().getMonth() + 1}월 일정`);
  const handleMonthChange = (d: Date) => {
    setMonthLabel(`${d.getMonth() + 1}월 일정`);
  };

  return (
    <div>
      {/* 상단 요약: 좌(유저정보) / 우(메모) */}
      <section className="summary">
        <div className="summary-left">
          <div className="summary-name">{user?.name ?? ""}</div>
          <div className="summary-email">{user?.email ?? ""}</div>
          <div className="summary-company">{company}</div>
          <div className="summary-phone">{user?.phone ?? ""}</div>
        </div>

        <div className="summary-right">
          <ul className="summary-bullets">
            {/* TODO: /calendar/today 연동 시 동적으로 교체 */}
            <li>오늘은 “기업 미팅”이(가) 예정됐습니다.</li>
            <li>3일 후 “미팅2”이(가) 있습니다.</li>
          </ul>
        </div>
      </section>

      <hr className="dash-sep" />

      {/* 캘린더 자리 */}
      <h3 className="calendar-title">{monthLabel}</h3>
      <div>
        <ProfileCalendar onMonthChange={handleMonthChange} />
      </div>
    </div>
  );
};

export default ProfilePage;
