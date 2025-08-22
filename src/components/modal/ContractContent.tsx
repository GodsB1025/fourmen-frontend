import React, { useEffect, useState, Suspense } from 'react';
import './ContractContent.css';
import type { AllContractData } from '../../types/contractForm';
import { contractFormComponents, initialContractData } from '../../utils/contractRegistry';
import { createContractPayload, type RecipientInfo, type UserInfo } from '../../utils/contractUtils';
import { sendContract } from '../../apis/Contract';
import { getUser } from '../../apis/User';
import TextInput from '../common/TextInput';
import type { MeetingDoc } from '../../apis/Types';
import { fetchDocsOfMeeting, fetchMeetingsWithDocs } from '../../apis/Documents';

interface ContractContentProps {
    templateId: string;
    eformsignTemplateId: string; // prop 추가
}

const ContractContent: React.FC<ContractContentProps> = ({ templateId, eformsignTemplateId }) => { // prop 받기

    // 계약서 관련 상태
    const [step, setStep] = useState<number>(0)
    const [data, setData] = useState<AllContractData>(initialContractData[templateId]);
    const [recipientData, setRecipientData] = useState({ name: "", email: "", phoneNumber: "" })

    // 회의록 관련 상태
    const [meetingsWithDocs, setMeetingsWithDocs] = useState<MeetingDoc[]>([]);
    const [selectedMeeting, setSelectedMeeting] = useState<MeetingDoc | null>(null);
    const [selectedMinuteContent, setSelectedMinuteContent] = useState<string | null>(null);
    const [minutesLoading, setMinutesLoading] = useState({ list: false, detail: false });
    const [viewState, setViewState] = useState<'MEETING_LIST' | 'MINUTE_LIST' | 'MINUTE_DETAIL'>('MEETING_LIST');

    const [busy, setBusy] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleDataChange = (updatedFields: Partial<AllContractData>) => {
        setData(prevData => ({
            ...prevData,
            ...updatedFields,
        }));
    };

    const loadMeetings = async () => {
        const data = await fetchMeetingsWithDocs()
        console.log("fetchMeetingsWithMinutes 함수 데이터 확인 :", data)
        setMeetingsWithDocs(data)
    }

    const submitContract = async () => {
        setBusy(true)
        setError(null)
        try {
            const user = await getUser()
            const recipientInfo: RecipientInfo = recipientData;
            const userInfo: UserInfo = { name: user!.name, email: user!.email, phoneNumber: user!.phone! };
            const documentTitle = `${recipientInfo.name}님의 전자 계약서 (템플릿 ID: ${templateId})`;

            const payload = createContractPayload({
                formData: data,
                recipientInfo,
                userInfo,
                documentTitle,
            });
            console.log("API에 전송할 최종 데이터:", JSON.stringify(payload, null, 2));
            await sendContract(payload, eformsignTemplateId); // 전달받은 eformsignTemplateId 사용
            alert("계약서가 성공적으로 발송되었습니다.");
        } catch (error) {
            console.error("계약서 발송 실패:", error);
            setError("계약서 발송에 실패했습니다.");
        } finally {
            setBusy(false)
        }
    }

    const handleShowDocs = async (meetingId: number) => {
        const data = await fetchDocsOfMeeting(meetingId)
    }

    const FormComponent = contractFormComponents[templateId];

    useEffect(() => {
        loadMeetings()
        setData(initialContractData[templateId]);
    }, [templateId]);

    return (
        <div className="contract-container">
            <div className="form-section">
                { step === 0 ? (
                        <h2>계약서 내용</h2>
                    ) : (
                        <h2>수신자 정보</h2>
                )}

                {FormComponent ? (
                    <div>
                        { step === 0 && (
                            <div>
                                <Suspense fallback={<div>Loading...</div>}>
                                    <FormComponent data={data} onChange={handleDataChange} />
                                </Suspense>
                                <div>
                                    <button onClick={() => setStep(1)}>
                                        다음으로
                                    </button>
                                </div>
                            </div>
                        ) }
                        { step === 1 && (
                            <div>
                                <div className='form-group'>
                                    <label>이름</label>
                                    <TextInput
                                    type='text'
                                    value={recipientData.name}
                                    onChange={e=>setRecipientData({...recipientData, name : e.target.value})}
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>이메일</label>
                                    <TextInput
                                    type='text'
                                    value={recipientData.email}
                                    onChange={e=>setRecipientData({...recipientData, email : e.target.value})}
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>전화번호</label>
                                    <TextInput
                                    type='text'
                                    value={recipientData.phoneNumber}
                                    onChange={e=>setRecipientData({...recipientData, phoneNumber : e.target.value})}
                                    />
                                </div>
                                <div>
                                    <button onClick={() => setStep(0)}>
                                        이전으로
                                    </button>
                                    <button onClick={submitContract} disabled={busy}>
                                        {busy ? "전송 중..." : "전송"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>유효하지 않은 계약서 템플릿입니다. (ID: {templateId})</div>
                )}

                {error && <p className='error-text'>{error}</p>}
            </div>

            <div className="content-section">
                <h2>회의록_제목1</h2>
                <div className="content-body">
                    {meetingsWithDocs.length === 0 ? (
                        <div>회의록 불러오는 중...</div>
                    ) : (
                        <ul>
                            {meetingsWithDocs.map((meeting) => (
                                <li key={meeting.meetingId}>
                                    <div 
                                        onClick={() => handleShowDocs(meeting.meetingId)}
                                    >
                                        {meeting.meetingTitle}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractContent;