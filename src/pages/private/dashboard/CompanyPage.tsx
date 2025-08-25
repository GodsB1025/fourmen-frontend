import React, { useEffect, useRef, useState } from "react";
import { fetchCompanyMembers, inviteCompanyMember, updateCompanyMemberRole } from "../../../apis/Company";
import type { CompanyMember, MemberRole } from "../../../apis/Types";
import MemberList from "../../../components/company/MemberList";
import InviteMemberModal from "../../../components/company/InviteMemberModal";
import RoleManagementModal from "../../../components/company/RoleManagementModal"; // 모달 import
import { useAuthStore } from "../../../stores/authStore";
import "./CompanyPage.css";

// Helper 함수들은 변경 없이 그대로 둡니다.
function canManageMember(currentRole: MemberRole | undefined, meId: number | string | undefined, target: CompanyMember) {
    if (!currentRole) return false;
    if (String(target.id) === String(meId)) return false;
    if (currentRole === "ADMIN") return target.role !== "ADMIN";
    if (currentRole === "CONTRACT_ADMIN") return target.role === "USER";
    return false;
}
function allowedTargetRoles(currentRole: MemberRole | undefined, meId: number | string | undefined, target: CompanyMember): MemberRole[] {
    if (!canManageMember(currentRole, meId, target)) return [target.role];
    if (currentRole === "ADMIN") return ["CONTRACT_ADMIN", "USER"];
    if (currentRole === "CONTRACT_ADMIN" && target.role === "USER") return ["USER", "CONTRACT_ADMIN"];
    return [target.role];
}
const makeOptimisticInvited = (email: string, role: MemberRole): CompanyMember => {
    const name = email.split("@")[0];
    return { id: -Date.now(), name, email, role, status: "INVITED", joinedAt: new Date().toISOString() };
};
const samePerson = (a: CompanyMember, b: CompanyMember) => String(a.id) === String(b.id) || a.email.toLowerCase() === b.email.toLowerCase();
const reconcile = (server: CompanyMember[], optimistics: CompanyMember[]) => {
    const keep = optimistics.filter((o) => !server.some((s) => samePerson(s, o)));
    return [...keep, ...server];
};

export default function CompanyPage() {
    const user = useAuthStore((s) => s.user);

    const meId = user?.userId as number | string | undefined;
    const myRole = user?.role as MemberRole | undefined;
    const companyId = typeof user?.company === "object" ? (user?.company as any)?.id : (user?.company as number | string | undefined);

    const canAccess = Boolean(companyId);
    const canInvite = myRole === "ADMIN";

    const [members, setMembers] = useState<CompanyMember[]>([]);
    const [optimisticsState, _setOptimisticsState] = useState<CompanyMember[]>([]);
    const optimRef = useRef<CompanyMember[]>([]);

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<CompanyMember | null>(null); // 권한 수정할 멤버 상태

    const setOptimistics = (updater: (prev: CompanyMember[]) => CompanyMember[]) => {
        _setOptimisticsState((prev) => {
            const next = updater(prev);
            optimRef.current = next;
            return next;
        });
    };

    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function loadMembers() {
        setBusy(true);
        setErr(null);
        try {
            const server = await fetchCompanyMembers();
            setMembers(reconcile(server, optimRef.current));
        } catch (e: any) {
            setErr(e?.response?.data?.message || "멤버를 불러오지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        optimRef.current = optimisticsState;
    }, []);

    useEffect(() => {
        if (!canAccess) return;
        loadMembers();
    }, [canAccess]);

    async function handleBulkInvite(pendingInvites: { email: string; role: MemberRole }[]) {
        if (!canInvite || pendingInvites.length === 0) return;

        const optimistics = pendingInvites.map((p) => makeOptimisticInvited(p.email, p.role));
        setOptimistics((prev) => [...optimistics, ...prev]);
        setMembers((prev) => [...optimistics, ...prev]);

        try {
            await Promise.all(pendingInvites.map((p) => inviteCompanyMember(p)));
        } catch {
            alert("일부 멤버를 초대하는 데 실패했습니다. 목록을 새로고침합니다.");
        } finally {
            const server = await fetchCompanyMembers();
            setMembers(reconcile(server, optimRef.current));
            setOptimistics((prev) => prev.filter((o) => !optimistics.some((op) => samePerson(o, op))));
        }
    }

    // 모달에서 저장 시 호출될 함수
    async function handleSaveRoleChange(newRole: MemberRole) {
        if (!editingMember) return;

        const prevMembers = members;
        // UI 즉시 업데이트
        setMembers((list) => list.map((m) => (m.id === editingMember.id ? { ...m, role: newRole } : m)));
        setEditingMember(null); // 모달 닫기

        try {
            await updateCompanyMemberRole(editingMember.id, newRole);
        } catch {
            setMembers(prevMembers); // 실패 시 롤백
            alert("권한 변경에 실패했습니다.");
        }
    }

    if (!canAccess) {
        return <div className="company-guard">회사에 소속된 사용자만 접근할 수 있습니다.</div>;
    }

    return (
        <div className="company-page-layout">
            <header className="company-header">
                <h2 className="company-title">멤버 관리</h2>
                {canInvite && (
                    <button className="invite-button" onClick={() => setIsInviteModalOpen(true)}>
                        + 멤버 초대
                    </button>
                )}
            </header>

            {err && <div className="company-error-banner">{err}</div>}

            <div className="member-list-card">
                <MemberList
                    items={members}
                    busy={busy}
                    myRole={myRole}
                    meId={meId}
                    onManageRole={setEditingMember} // 관리 버튼 클릭 시 editingMember 상태 설정
                    canManage={(t) => canManageMember(myRole, meId, t)}
                />
            </div>

            {isInviteModalOpen && canInvite && <InviteMemberModal onClose={() => setIsInviteModalOpen(false)} onInvite={handleBulkInvite} />}

            {/* editingMember가 있을 때만 권한 관리 모달을 렌더링 */}
            {editingMember && (
                <RoleManagementModal
                    member={editingMember}
                    allowedRoles={allowedTargetRoles(myRole, meId, editingMember)}
                    onClose={() => setEditingMember(null)}
                    onSave={handleSaveRoleChange}
                />
            )}
        </div>
    );
}
