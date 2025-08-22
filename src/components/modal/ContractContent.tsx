import React, { useEffect, useState, Suspense } from 'react';
import './ContractContent.css';
import type { AllContractData } from '../../types/contractForm';
import { contractFormComponents, initialContractData } from '../../utils/contractRegistry';
import { createContractPayload, type RecipientInfo, type UserInfo } from '../../utils/contractUtils';
import { sendContract } from '../../apis/Contract';
import { getUser } from '../../apis/User';
import TextInput from '../common/TextInput';
import type { MeetingDoc, MinuteInfo } from '../../apis/Types';
import { fetchMeetingsWithDocs } from '../../apis/Documents';
import { getMinuteDetails, getMinutesForMeeting } from '../../apis/Meeting';
import Markdown from 'react-markdown';

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
    const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
    const [minutesOfExpandedMeeting, setMinutesOfExpandedMeeting] = useState<MinuteInfo[]>([]);
    const [selectedMinuteContent, setSelectedMinuteContent] = useState<string | null>(null);
    const [minutesLoading, setMinutesLoading] = useState({ list: false, detail: false });

    const [busy, setBusy] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleDataChange = (updatedFields: Partial<AllContractData>) => {
        setData(prevData => ({
            ...prevData,
            ...updatedFields,
        }));
    };

    const loadMeetings = async () => {
        setMinutesLoading(prev => ({ ...prev, list: true }));
        try {
            const data = await fetchMeetingsWithDocs()
            console.log("fetchMeetingsWithMinutes 함수 데이터 확인 :", data)    
            setMeetingsWithDocs(data)
        } catch (err: unknown) {
            console.error(err)
            let errorMessage = "회의 목록 조회 중 오류가 발생했습니다.";
            if (err instanceof Error) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setMinutesLoading(prev => ({ ...prev, list: false }));
        }
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

    // 회의를 클릭했을 때 회의록 목록을 보여주는 핸들러 함수
    const handleShowDocs = async (meetingId: number) => {
        // 이미 열려있는 회의를 다시 클릭하면 닫음
        setError(null)
        if (selectedMeetingId === meetingId) {
            setSelectedMeetingId(null);
            setMinutesOfExpandedMeeting([]);
            return;
        }

        setMinutesLoading(prev => ({ ...prev, detail: true }));
        try {
            const minutes = await getMinutesForMeeting(meetingId);
            setMinutesOfExpandedMeeting(minutes);
            setSelectedMeetingId(meetingId); // 새로 클릭한 회의 ID를 저장
        } catch (error) {
            setError("회의록 목록을 불러오는 데 실패했습니다.");
        } finally {
            setMinutesLoading(prev => ({ ...prev, detail: false }));
        }
    }

    // 특정 회의록을 클릭했을 때 내용을 불러오는 함수
    const handleMinuteClick = async (minuteId: number) => {
        if (!selectedMeetingId) return;
        setError(null)
        setMinutesLoading(prev => ({ ...prev, detail: true }));
        try {
            const minuteDetails = await getMinuteDetails(selectedMeetingId, minuteId);
            console.log(minuteDetails.content)
            setSelectedMinuteContent(minuteDetails.content); // 불러온 내용을 상태에 저장
        } catch (err) {
            setError("회의록 내용을 불러오는데 실패했습니다.");
        } finally {
            setMinutesLoading(prev => ({ ...prev, detail: false }));
        }
    }

    const FormComponent = contractFormComponents[templateId];

    useEffect(() => {
        loadMeetings()
        setData(initialContractData[templateId]);
    }, [templateId]);

    return (
        <>
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
            </div>

            <div className="content-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>회의록 가져오기</h2>
                    {selectedMinuteContent && (
                        <button onClick={()=>setSelectedMinuteContent(null)}>뒤로가기</button>
                    )}
                </div>
                <div className="content-body">
                    {selectedMinuteContent ? (
                        <div className="minute-content-display">
                            {minutesLoading.detail ? 
                                <p>회의록 내용 로딩 중...</p> : 
                                <pre><Markdown>
                                    {selectedMinuteContent}
                                </Markdown></pre>
                            }
                        </div>
                    ) : (
                        minutesLoading.list ? (
                            <div>회의 목록을 불러오는 중...</div>
                        ) : (
                            <ul className="meeting-list">
                                {meetingsWithDocs.map((meeting) => (
                                    <li key={meeting.meetingId} className="meeting-item">
                                        <div 
                                            className="meeting-title"
                                            onClick={() => handleShowDocs(meeting.meetingId)}
                                        >
                                            {meeting.meetingTitle}
                                        </div>
                                        {/* 선택된 회의의 ID와 현재 회의의 ID가 같으면 회의록 목록을 표시 */}
                                        {selectedMeetingId === meeting.meetingId && (
                                            <div className="minute-list-container">
                                                {minutesLoading.detail ? (
                                                    <p>회의록 목록 로딩 중...</p>
                                                ) : (
                                                    <ul>
                                                        {minutesOfExpandedMeeting.length > 0 ?
                                                            minutesOfExpandedMeeting.map(minute => (
                                                                <li key={minute.minuteId} className="minute-item" onClick={() => handleMinuteClick(minute.minuteId)}>
                                                                    {minute.type === "AUTO" && "🤖 AI 회의록"}
                                                                    {minute.type === "SELF" && "✍️ 수동 회의록"}
                                                                    {minute.type === "SUMMARY" && "✨ AI 요약본"}
                                                                </li>
                                                            )) : <p>이 회의에는 작성된 회의록이 없습니다.</p>
                                                        }
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )
                    )}
                </div>
            </div>
        </div>
        {error && <p className='error-text'>{error}</p>}
        </>
    );
};

export default ContractContent;