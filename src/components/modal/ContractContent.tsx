import React, { useEffect, useState, Suspense } from 'react';
import './ContractContent.css';
import type { AllContractData } from '../../types/contractForm';
import { contractFormComponents, initialContractData } from '../../utils/contractRegistry';
import { createContractPayload, type RecipientInfo, type UserInfo } from '../../utils/contractUtils';
import { sendContract } from '../../apis/Contract';

interface ContractContentProps {
    templateId: string;
}

const ContractContent: React.FC<ContractContentProps> = ({ templateId }) => {
    const [data, setData] = useState<AllContractData>(initialContractData[templateId]);

    useEffect(() => {
        setData(initialContractData[templateId]);
    }, [templateId]);

    const handleDataChange = (updatedFields: Partial<AllContractData>) => {
        setData(prevData => ({
            ...prevData,
            ...updatedFields,
        }));
    };

    const submitContract = async () => {
        const recipientInfo: RecipientInfo = { name: "제갈태웅", email: "wprkf1005@gmail.com", phoneNumber: "01098401789" };
        const userInfo: UserInfo = { name: "홍성재", email: "auraghd@gmail.com", phoneNumber: "01036137488" };
        const documentTitle = `${recipientInfo.name}님의 전자 계약서 (템플릿 ID: ${templateId})`;

        try {
            const payload = createContractPayload({
                formData: data,
                recipientInfo,
                userInfo,
                documentTitle,
            });
            console.log("API에 전송할 최종 데이터:", JSON.stringify(payload, null, 2));
            await sendContract(payload, "EFORM_TEMPLATE_002");
            alert("계약서가 성공적으로 발송되었습니다.");
        } catch (error) {
            console.error("계약서 발송 실패:", error);
            alert("계약서 발송에 실패했습니다.");
        }
    }

    // 1. templateId를 사용해 contractRegistry에서 해당 컴포넌트를 찾습니다.
    const FormComponent = contractFormComponents[templateId];

    return (
        <div className="contract-container">
            <div className="form-section">
                <h2>계약서 내용</h2>
                <div>
                    {/* 2. FormComponent가 존재하면 동적으로 렌더링합니다. */}
                    {FormComponent ? (
                        // React.lazy로 불러온 컴포넌트는 Suspense로 감싸주어야 합니다.
                        <Suspense fallback={<div>Loading...</div>}>
                            <FormComponent data={data} onChange={handleDataChange} />
                        </Suspense>
                    ) : (
                        <div>유효하지 않은 계약서 템플릿입니다. (ID: {templateId})</div>
                    )}
                </div>
                <div>
                    <button onClick={submitContract}>
                        전송
                    </button>
                </div>
            </div>

            <div className="content-section">
                <h2>회의록_제목1</h2>
                <div className="content-body">
                    {/* ... 회의록 내용 ... */}
                </div>
            </div>
        </div>
    );
};

export default ContractContent;