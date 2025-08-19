export interface ContractData_201 {
    name: string,
    amount: string
}

export interface ContractData_202 {
    item: string,
    quantity: string
}

export type AllContractData = ContractData_201 | ContractData_202;

// 모든 계약서 폼 컴포넌트가 공통으로 받을 Props 타입 (Generic 사용)
export interface ContractFormProps<T> {
    data: T;
    // 데이터를 업데이트하는 함수: 부분적인 업데이트를 허용하기 위해 Partial<T> 사용
    onChange: (updatedFields: Partial<T>) => void;
}