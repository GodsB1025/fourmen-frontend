import React, { useEffect, useRef, useState } from "react";
import {
  fetchCompanyMembers, // 직접 사용
  inviteCompanyMember,
  updateCompanyMemberRole,
  type CompanyMember,
  type MemberRole,
} from "../../../apis/Company";
import MemberList from "../../../components/company/MemberList";
import InviteMemberForm from "../../../components/company/InviteMemberForm";
import { useAuthStore } from "../../../stores/authStore";
import "./CompanyPage.css";

// helper 함수들은 변경 없음
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
function makeOptimisticInvited(email: string, role: MemberRole): CompanyMember {
  const name = email.split("@")[0];
  return { id: -Date.now(), name, email, role, status: "INVITED", joinedAt: new Date().toISOString() };
}
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

  const setOptimistics = (updater: (prev: CompanyMember[]) => CompanyMember[]) => {
    _setOptimisticsState((prev) => {
      const next = updater(prev);
      optimRef.current = next;
      return next;
    });
  };

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ 수정: 불필요한 함수를 제거하고 loadMembers에서 직접 API 호출
  async function loadMembers() {
    setBusy(true);
    setErr(null);
    try {
      const server = await fetchCompanyMembers(); // fetchCompanyMembers를 직접 호출
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess]);

  async function handleInvite(payload: { email: string; role: MemberRole }) {
    if (!canInvite) return;
    const optimistic = makeOptimisticInvited(payload.email, payload.role);
    setOptimistics((prev) => [optimistic, ...prev]);
    setMembers((prev) => [optimistic, ...prev]);

    try {
      const res = await inviteCompanyMember(payload);
      if (res.member) {
        setMembers((prev) => prev.map((m) => (samePerson(m, optimistic) ? (res.member as CompanyMember) : m)));
        setOptimistics((prev) => prev.filter((m) => !samePerson(m, optimistic)));
      } else {
        // ✅ 수정: fetchCompanyMembers를 직접 호출
        const server = await fetchCompanyMembers();
        setMembers(reconcile(server, optimRef.current));
      }
    } catch {
      setMembers((prev) => prev.filter((m) => !samePerson(m, optimistic)));
      setOptimistics((prev) => prev.filter((m) => !samePerson(m, optimistic)));
      alert("초대에 실패했습니다.");
    }
  }

  async function handleChangeRole(target: CompanyMember, nextRole: MemberRole) {
    if (!canManageMember(myRole, meId, target)) return;
    const prev = members;
    setMembers((list) => list.map((m) => (m.id === target.id ? { ...m, role: nextRole } : m)));
    try {
      await updateCompanyMemberRole(target.id, nextRole);
    } catch {
      setMembers(prev);
      alert("권한 변경에 실패했습니다.");
    }
  }

  if (!canAccess) {
    return <div className="company-guard">회사에 소속된 사용자만 접근할 수 있습니다.</div>;
  }

  return (
    <div className="company-wrap">
      <div className="company-columns">
        <section className="company-left">
          <div className="company-section-title">현재 가입된 회사 인원</div>
          {err && <div className="company-error">{err}</div>}
          <MemberList
            items={members}
            busy={busy}
            myRole={myRole}
            meId={meId}
            onChangeRole={handleChangeRole}
            getAllowedRoles={(t) => allowedTargetRoles(myRole, meId, t)}
            canManage={(t) => canManageMember(myRole, meId, t)}
          />
        </section>
        {canInvite ? (
          <section className="company-right">
            <div className="company-section-title">멤버 추가</div>
            <InviteMemberForm onSubmit={handleInvite} />
          </section>
        ) : (
          <section className="company-right">
            <div className="company-section-title">멤버 추가</div>
            <div className="company-guard">멤버 추가는 관리자만 가능합니다.</div>
          </section>
        )}
      </div>
    </div>
  );
}
