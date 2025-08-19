import React, { useEffect, useState } from 'react';
import './ContractContent.css'; // 스타일을 위한 CSS 파일을 import 합니다.
import Contract_202 from '../contract/forms/contract_202';
import type { AllContractData } from '../../types/contractForm';
import { contractFormComponents, initialContractData } from '../../utils/contractRegistry';
import type { RecipientInfo, UserInfo } from '../../utils/contractUtils';

// ContractContent는 어떤 계약서를 보여줄지 templateId를 props로 받습니다.
interface ContractContentProps {
    templateId: string;
}

const submitContract = async () => {
    // 실제 애플리케이션에서는 이 정보들을 props나 전역 상태(Context, Redux 등)에서 가져옵니다.
    const recipientInfo: RecipientInfo = { 
        name: "김수신", 
        email: "recipient@example.com", 
        phoneNumber: "01012345678" 
    };
    const userInfo: UserInfo = { 
        name: "박발신", 
        email: "user@myapp.com", 
        phoneNumber: "01087654321"
    };

    // contractRegistry 등에서 템플릿 이름을 가져올 수 있습니다.
    const documentTitle = `${recipientInfo.name}님의 근로계약서 (템플릿 ID: ${templateId})`;

    try {
        // 유틸리티 함수를 호출하여 최종 페이로드 생성
        const payload = createContractPayload({
            formData: data, // 컴포넌트가 state로 관리하는 폼 데이터
            recipientInfo,
            userInfo,
            documentTitle,
            comment: "내용 검토 후 서명 부탁드립니다." // 선택적으로 주석 전달
        });

        console.log("API에 전송할 최종 데이터:", JSON.stringify(payload, null, 2));

        // 생성된 payload로 API 호출
        // await api.sendContract(payload); 

        alert("계약서가 성공적으로 발송되었습니다.");

    } catch (error) {
        console.error("계약서 발송 실패:", error);
        alert("계약서 발송에 실패했습니다.");
    }
}

const ContractContent: React.FC<ContractContentProps> = ({ templateId }) => {

    // 1. 상태의 타입으로 Union 타입을 사용합니다.
    const [data, setData] = useState<AllContractData>(initialContractData[templateId]);

    // 2. templateId가 변경되면 상태를 해당 템플릿의 초기값으로 리셋합니다.
    useEffect(() => {
        setData(initialContractData[templateId]);
    }, [templateId]);

    // 3. 자식 컴포넌트에서 호출할 공통 핸들러
    const handleDataChange = (updatedFields: Partial<AllContractData>) => {
        setData(prevData => ({
            ...prevData,
            ...updatedFields,
        }));
    };

    const submitContract = async () => {
        console.log(`[${templateId}] 전송 데이터:`, data);
        // await api.submit(templateId, data);
    };

    // 4. templateId에 해당하는 컴포넌트를 맵에서 찾습니다.
    const FormComponent = contractFormComponents[templateId];

    return (
        <div className="contract-container">
            {/* 왼쪽 폼 섹션 */}
            {/* 존재하지 않는 templateId에 대한 처리 */}
            {!FormComponent
                ? <div>유효하지 않은 계약서 템플릿입니다.</div>
                : <div className="form-section">
                    <h2>계약서 내용</h2>
                    <div>
                        <Contract_202 /> {/* 상황에 따라 즉, templateId에 따라 다른 Component가 나와야 함 */}
                    </div>
                    <div>
                        <button
                        onClick={submitContract}
                        > 전송 </button>
                    </div>
                </div>
            }

            {/* 오른쪽 회의록 섹션 */}
            <div className="content-section">
                <h2>회의록_제목1</h2>
                <div className="content-body">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                        Suspendisse quis ipsum placerat, sollicitudin eu, cursus arcu. 
                        Suspendisse pulvinar consectetuer vitae rhoncus. Praesent ante metus, 
                        efficitur at magna vitae, elementum ac velit. Donec justo elit, 
                        varius molestie at, venenatis non eros. Phasellus dignissim auctor porta. 
                        Proin commodo eget ligula in fermentum. Quisque elementum vestibulum condimentum.
                    </p>
                    <p>
                        Interdum et malesuada fames ac ante ipsum primis in faucibus. 
                        Suspendisse vitae enim a diam pulvinar dapibus. Sed posuere dictum turpis, 
                        feugiat efficitur leo viverra ut. Mauris suscipit scelerisque lectus, 
                        at molestie feugiat sem congue ut. Pellentesque curabitur tellus in justo lobortis iaculis.
                    </p>
                    <p>
                        Mauris sodales, metus et pharetra condimentum, nisl nisi scelerisque ante, 
                        eget vestibulum eros justo et justo. Curabitur nec feugiat lorem. 
                        Aliquam accumsan turpis nibh, vel mattis lacus tempus eu. 
                        Suspendisse sed ullamcorper augue, vitae pretium mauris.
                    </p>
                    <p>
                        Pellentesque nec turpis sodales, fringilla turpis sed, ultrices ex. 
                        Suspendisse id augue quis nibh pulvinar cursus. Duis pharetra commodo urna, 
                        in mollis orci iaculis in. Vestibulum pharetra tincidunt ligula. 
                        Fusce tristique convallis nisl, id finibus enim dignissim non. 
                        Nulla a blandit ante. Fusce cursus, purus non bibendum congue, dui velit dignissim risus, 
                        ut consectetur ex massa quis ex. Nunc ac dolor pharetra, bibendum eros sagittis, 
                        vulputate orci. Donec gravida.
                    </p>
                </div>
            </div>
            {/* 참고: 이미지의 빨간색 X 버튼은 일반적으로 부모 Modal 컴포넌트에서 관리합니다. */}
        </div>
    );
};

export default ContractContent;