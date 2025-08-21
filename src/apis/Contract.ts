import api from "./Client";
import type { Contract, ContractRequest, CompletedContract } from "./Types"; // CompletedContract 추가

export const getContractTemplate = async (): Promise<Contract[]> => {
    const { data } = await api.get("/templates");
    return data.data;
};

export const sendContract = async (payload: ContractRequest, eformsignTemplateId: string): Promise<void> => {
    await api.post(`/contracts?templateId=${eformsignTemplateId}`, payload);
};

// ✅ 아래 함수 추가
export const getCompletedContracts = async (): Promise<CompletedContract[]> => {
    const { data } = await api.get("/contracts/completed");
    return data.data;
};
