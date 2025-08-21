import React from "react";
import type { CompanyMember, MemberRole } from "../../apis/Company";
import "./MemberList.css";

const roleLabel: Record<MemberRole, string> = {
    ADMIN: "관리자",
    CONTRACT_ADMIN: "계약 관리자",
    USER: "일반 직원",
};

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

type Props = {
    items: CompanyMember[];
    busy?: boolean;
    myRole?: MemberRole;
    meId?: number | string;
    onManageRole?: (m: CompanyMember) => void; // onManageRole prop 추가
    canManage?: (m: CompanyMember) => boolean;
    className?: string;
};

export default function MemberList({ items, busy, meId, onManageRole, canManage, className }: Props) {
    const initialList = Array.isArray(items) ? items : [];

    const me = meId ? initialList.find((m) => String(m.id) === String(meId)) : undefined;
    const others = meId ? initialList.filter((m) => String(m.id) !== String(meId)) : initialList;

    const sortedOthers = others.sort((a, b) => {
        const orderA = roleOrder[a.role] ?? 99;
        const orderB = roleOrder[b.role] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
    });

    const list = me ? [me, ...sortedOthers] : sortedOthers;

    const containerClassName = `member-list-wrapper ${className || ""}`.trim();

    return (
        <div className={containerClassName}>
            {busy ? (
                <div className="member-list-status">멤버 목록을 불러오는 중...</div>
            ) : !list.length ? (
                <div className="member-list-status">표시할 멤버가 없습니다.</div>
            ) : (
                <ul className="member-list">
                    {list.map((m) => {
                        const isMe = String(m.id) === String(meId);
                        const manageable = !isMe && canManage ? canManage(m) : false;
                        const statusKey = (m.status ?? "ACTIVE") as keyof typeof statusLabel;

                        return (
                            <li key={m.id ?? m.email} className={`member-item ${isMe ? "is-me" : ""}`}>
                                <div className="member-info">
                                    <span className="member-name">
                                        {m.name}
                                        {isMe && <span className="my-badge">나</span>}
                                    </span>
                                    <span className="member-email">{m.email}</span>
                                </div>

                                <div className="member-meta">
                                    <span className={`member-role-badge role-${m.role.toLowerCase()}`}>{roleLabel[m.role]}</span>
                                    {statusKey !== "ACTIVE" && (
                                        <span className={`member-status-badge status-${String(statusKey).toLowerCase()}`}>
                                            {statusLabel[statusKey]}
                                        </span>
                                    )}
                                </div>

                                <div className="member-actions">
                                    {manageable ? (
                                        <button className="manage-role-btn" onClick={() => onManageRole?.(m)}>
                                            권한 관리
                                        </button>
                                    ) : (
                                        <div className="action-placeholder" />
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
