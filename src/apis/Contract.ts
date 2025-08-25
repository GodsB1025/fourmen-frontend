import api from "./Client";
import type { Contract, ContractRequest, CompletedContract } from "./Types"; // CompletedContract 추가

export const getContractTemplate = async (): Promise<Contract[]> => {
    const { data } = await api.get("/templates");
    return data.data;
};

// ✅ minutesId 파라미터를 추가하고, API 호출 시 쿼리 스트링으로 전달하도록 수정
export const sendContract = async (
    payload: ContractRequest,
    eformsignTemplateId: string,
    minutesId?: number | null // minutesId를 선택적 인자로 추가
): Promise<void> => {
    // URL을 동적으로 구성
    let url = `/contracts?templateId=${eformsignTemplateId}`;
    if (minutesId) {
        url += `&minutesId=${minutesId}`;
    }
    await api.post(url, payload);
};

// ✅ 아래 함수 추가
export const getCompletedContracts = async (): Promise<CompletedContract[]> => {
    const { data } = await api.get("/contracts/completed");
    return data.data;
};
