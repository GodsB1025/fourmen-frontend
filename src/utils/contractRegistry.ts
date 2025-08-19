import React from 'react';
import { type AllContractData, type ContractData_202 } from '../types/contractForm';

// 컴포넌트를 동적으로 불러오기 (Lazy Loading)
const Contract_202 = React.lazy(() => import('../components/contract/forms/contract_202'));
// const Contract_203 = React.lazy(() => import('./forms/Contract_203'));

// ID와 컴포넌트를 매핑
export const contractFormComponents: Record<string, React.LazyExoticComponent<any>> = {
    '202': Contract_202,
    // '203': Contract_203,
};

// ID와 초기 데이터를 매핑
export const initialContractData: Record<string, AllContractData> = {
    '202': {
        item: '',
        quantity: '',
    } as ContractData_202,
    // '203': {
    //     itemName: '',
    //     quantity: 0,
    //     unitPrice: 0,
    //     deliveryAddress: '',
    // } as ContractData_203,
};