import api from "./Client"
import type { Contract, ContractRequest } from "./Types"

export const getContractTemplate = async () : Promise<Contract[]> => {
    const { data } = await api.get('/templates')
    // console.log("계약서 형식 확인:", data)
    return data.data
}

export const sendContract = async (payload : ContractRequest, eformsignTemplateId : string) : Promise<void> => {
    await api.post(`/contracts?templateId=${eformsignTemplateId}`, payload)
}