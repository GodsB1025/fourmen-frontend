import api from "./Client";

export type MemberRole = "ADMIN" | "USER" | "CONTRACT_ADMIN";
export type MemberStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export interface CompanyMember {
  id: number;
  name: string;
  email: string;
  role: MemberRole;
  status?: MemberStatus;
  joinedAt?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: MemberRole;
}

// 내부 유틸: 서버 → 프론트 모델 매핑
function mapToCompanyMember(raw: any): CompanyMember {
  return {
    id: raw?.id ?? raw?.userId,
    name: raw?.name ?? "",
    email: raw?.email ?? "",
    role: raw?.role as MemberRole,
    status: (raw?.status ?? "ACTIVE") as MemberStatus,
    joinedAt: raw?.joinedAt ?? undefined,
  };
}

// 멤버 목록 조회 (최종 수정된 함수)
export async function fetchCompanyMembers(): Promise<CompanyMember[]> {
  const { data } = await api.get(`/companies/members`);

  // ✅ 해결: 서버 응답 구조에 맞게 data.data에서 배열을 추출합니다.
  const memberList = data?.data;

  // 추출된 값이 배열인지 확인합니다.
  if (!Array.isArray(memberList)) {
    console.error("API 응답의 'data' 속성이 배열이 아닙니다:", data);
    return []; // 에러 방지를 위해 빈 배열 반환
  }

  return memberList.map(mapToCompanyMember);
}

// 초대 API
export async function inviteCompanyMember(body: InviteMemberRequest) {
  const { data } = await api.post(`/companies/addMembers`, body);
  const member = data?.member ? mapToCompanyMember(data.member) : undefined;
  return { ok: !!data?.ok, member } as { ok: boolean; member?: CompanyMember };
}

// 권한 변경
export async function updateCompanyMemberRole(userId: number, role: MemberRole) {
  const { data } = await api.patch(`/companies/members/${userId}/role`, { role });
  return data as { ok: boolean };
}
