import React from "react";
import type { CompanyMember, MemberRole } from "../../apis/Company";

type Props = {
  items: CompanyMember[];
  busy?: boolean;
  myRole?: MemberRole;
  meId?: number | string;
  onChangeRole?: (m: CompanyMember, role: MemberRole) => void;
  getAllowedRoles?: (m: CompanyMember) => MemberRole[];
  canManage?: (m: CompanyMember) => boolean;
};

const roleLabel: Record<MemberRole, string> = {
  ADMIN: "관리자",
  CONTRACT_ADMIN: "계약 관리자",
  USER: "일반 직원",
};

// 역할 정렬 순서 정의 (관리자 > 계약 관리자 > 일반 직원)
const roleOrder: Record<MemberRole, number> = {
  ADMIN: 0,
  CONTRACT_ADMIN: 1,
  USER: 2,
};

const statusLabel = {
  ACTIVE: "활성",
  INVITED: "초대됨",
  SUSPENDED: "정지",
} as const;

export default function MemberList({
  items,
  busy,
  meId,
  onChangeRole,
  getAllowedRoles,
  canManage,
}: Props) {
  const initialList = Array.isArray(items) ? items : [];

  // 1. 본인 제외
  const filteredList = meId ? initialList.filter((m) => String(m.id) !== String(meId)) : initialList;

  // 2. 역할에 따라 목록을 정렬
  const list = filteredList.sort((a, b) => {
    const orderA = roleOrder[a.role] ?? 99; // 혹시 모를 예외 역할은 맨 뒤로
    const orderB = roleOrder[b.role] ?? 99;
    return orderA - orderB;
  });

  if (busy) return <div className="company-loading">불러오는 중...</div>;
  if (!list.length) return <div className="company-empty">멤버가 없습니다.</div>;

  return (
    <ul className="member-list">
      {list.map((m) => {
        const manageable = canManage ? canManage(m) : false;
        const allowed = getAllowedRoles ? getAllowedRoles(m) : [m.role];
        const statusKey = (m.status ?? "ACTIVE") as keyof typeof statusLabel;

        return (
          <li key={m.id ?? m.email} className="member-item">
            <div className="member-main">
              <span className="member-name">{m.name}</span>
              {' '} {/* ✅ 수정: 이름과 이메일 사이에 공백 추가 */}
              <span className="member-email">{m.email}</span>
            </div>

            <div className="member-meta">
              <span className="member-role-badge">{roleLabel[m.role]}</span>
              {statusKey !== "ACTIVE" && (
                <span className={`member-status-badge status-${String(statusKey).toLowerCase()}`}>
                  {statusLabel[statusKey]}
                </span>
              )}
            </div>

            {manageable && allowed.length > 1 && onChangeRole ? (
              <div className="member-actions">
                <select
                  className="member-role-select"
                  value={m.role}
                  onChange={(e) => onChangeRole(m, e.target.value as MemberRole)}
                >
                  {allowed.map((r) => (
                    <option key={r} value={r}>
                      {roleLabel[r]}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
