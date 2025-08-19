import React, { useEffect, useState } from 'react'
import { getContractTemplate } from '../../apis/Contract'
import type { Contract } from '../../apis/Types';
import SkeletonCard from '../../components/contract/SkeletonCard'; // 1. 스켈레톤 컴포넌트 import
import ContractCard from '../../components/contract/ContractCard';
import { useModalStore } from '../../stores/modalStore';

const ContractPage = () => {
    const openModal = useModalStore((state)=>state.openModal)

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [busy, setBusy] = useState<boolean>(false); // 초기 로딩을 위해 true로 변경
    const [error, setError] = useState<string | null>(null);

    const loadContracts = async () => {
        // 이미 busy 상태가 아니면 다시 호출하지 않도록 처리
        if (busy) return; 

        setBusy(true) 
        setError(null)      
        try {
            const data : Contract[] = await getContractTemplate();
            setContracts(data);
        } catch (err: unknown) {
            setError("데이터를 불러오는 데 실패했습니다.");
            console.error("계약서 불러오기 실패:", err);
        } finally {
            setBusy(false)
        }
    }

    const openContract = () => {
        console.log("contract 실행")
        openModal('contractForm')
    }

    useEffect(() => {
        loadContracts()
    }, [])

    return (
        <div>
            <h1>전자 계약</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {/* busy 상태일 때 스켈레톤 UI 렌더링 */}
                {busy ? (
                    // 로딩 중일 때 보여줄 스켈레톤 카드의 개수 length로 정하기 (예: 3개)
                    Array.from({ length: 3 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))
                ) : (
                    // 로딩이 끝나면 실제 데이터 렌더링
                    contracts.map((contract) => (
                        <ContractCard 
                            contract={contract}
                            handleClick={openContract}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

export default ContractPage;