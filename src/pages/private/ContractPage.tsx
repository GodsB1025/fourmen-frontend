import React, { useEffect, useState } from 'react'
import { getContractTemplate } from '../../apis/Contract'
import type { Contract } from '../../apis/Types';
import SkeletonCard from '../../components/contract/SkeletonCard';
import ContractCard from '../../components/contract/ContractCard';
import { useModalStore } from '../../stores/modalStore';

const ContractPage = () => {
    const openModal = useModalStore((state)=>state.openModal)

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [busy, setBusy] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadContracts = async () => {
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

    const openContract = (contract: Contract) => {
        console.log("contract 실행, ID:", contract.templateId, "eformsign ID:", contract.eformsignTemplateId);
        // 모달을 열 때 타입과 함께 templateId와 eformsignTemplateId를 데이터로 전달합니다.
        openModal('contractForm', {
            templateId: String(contract.templateId),
            eformsignTemplateId: contract.eformsignTemplateId,
        });
    }

    useEffect(() => {
        loadContracts()
    }, [])

    return (
        <div>
            <h1>전자 계약</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {busy ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))
                ) : (
                    contracts.map((contract) => (
                        <ContractCard
                            key={contract.templateId}
                            contract={contract}
                            handleClick={() => openContract(contract)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

export default ContractPage;