import React from 'react';
import {
    type AllContractData,
    type ContractData_201,
    type ContractData_202,
    type ContractFormProps
} from '../types/contractForm';

// 컴포넌트를 동적으로 불러오기 (Lazy Loading)
const Contract_201 = React.lazy(() => import('../components/contract/forms/Contract_201'));
const Contract_202 = React.lazy(() => import('../components/contract/forms/Contract_202'));
// const Contract_203 = React.lazy(() => import('./forms/Contract_203'));

// ID와 컴포넌트를 매핑
export const contractFormComponents: Record<string, React.LazyExoticComponent<React.ComponentType<ContractFormProps<any>>>> = {
    201: Contract_201,
    202: Contract_202,
    // 203: Contract_203,
};

// ID와 초기 데이터를 매핑
export const initialContractData: Record<string, AllContractData> = {
    201: {
        "근로자": '',
        "시작년": '',
        "시작월": '',
        "시작일": '',
        "끝년": '',
        "끝월": '',
        "끝일": '',
        "업무내용": '',
        "월급": '',
    } as ContractData_201,
    202: {
        item: '',
        quantity: '',
    } as ContractData_202,
    // 203: {
    //     itemName: '',
    //     quantity: 0,
    //     unitPrice: 0,
    //     deliveryAddress: '',
    // } as ContractData_203,
};