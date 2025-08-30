import React, { useEffect, useState, Suspense, useMemo } from "react";
import "./ContractContent.css";
import type { AllContractData } from "../../types/contractForm";
import { contractFormComponents, initialContractData } from "../../utils/contractRegistry";
import { createContractPayload, type RecipientInfo, type UserInfo } from "../../utils/contractUtils";
import { sendContract } from "../../apis/Contract";
import { getUser } from "../../apis/User";
import TextInput from "../common/TextInput";
import type { MeetingDoc, MinuteInfo, SharedMinuteResponse } from "../../apis/Types";
import { fetchMeetingsWithDocs, fetchSharedMinutes } from "../../apis/Documents";
import { getMinuteDetails, getMinutesForMeeting } from "../../apis/Meeting";
import Markdown from "react-markdown";
import Toast from "../common/Toast";
import { IconAISummary, IconArrowLeft, IconArrowRight, IconAutoREC, IconPancil, FileTextIcon } from "../../assets/icons";
import SlideToSubmitButton from "../common/SlideToSubmitButton";
import CustomSwitch from "../common/CustomSwitch";
import { useModalStore } from "../../stores/modalStore";

interface ContractContentProps {
    templateId: string;
    eformsignTemplateId: string;
}

const ContractContent: React.FC<ContractContentProps> = ({ templateId, eformsignTemplateId }) => {
    const closeModal = useModalStore((state) => state.closeModal);
    const [step, setStep] = useState<number>(0);
    const [data, setData] = useState<AllContractData>(initialContractData[templateId]);
    const [recipientData, setRecipientData] = useState({ name: "", email: "", phoneNumber: "" });
    const [docTab, setDocTab] = useState("my");
    const [meetingsWithDocs, setMeetingsWithDocs] = useState<MeetingDoc[]>([]);
    const [sharedMinutes, setSharedMinutes] = useState<SharedMinuteResponse[]>([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
    const [minutesOfExpandedMeeting, setMinutesOfExpandedMeeting] = useState<MinuteInfo[]>([]);
    const [selectedMinuteContent, setSelectedMinuteContent] = useState<string | null>(null);
    const [minutesLoading, setMinutesLoading] = useState({ list: false, detail: false });
    const [busy, setBusy] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedMinuteId, setSelectedMinuteId] = useState<number | null>(null);

    const [isFormStepRequired, setIsFormStepRequired] = useState<boolean>(true);

    const docTabOptions = [
        { value: "my", label: "내 문서" },
        { value: "shared", label: "공유받은 문서" },
    ];

    const isFormValid = useMemo(() => {
        const isRecipientValid = recipientData.name.trim() !== "" && recipientData.email.trim() !== "" && recipientData.phoneNumber.trim() !== "";
        if( !isFormStepRequired ) {
            return isRecipientValid;
        }
        const isContractDataValid = Object.values(data).every((value) => {
            if (typeof value === "string") return value.trim() !== "";
            return true;
        });
        return isRecipientValid && isContractDataValid;
    }, [data, recipientData, isFormStepRequired]);

    const handleDataChange = (updatedFields: Partial<AllContractData>) => {
        setData((prevData) => ({
            ...prevData,
            ...updatedFields,
        }));
    };

    const loadDocuments = async () => {
        setMinutesLoading((prev) => ({ ...prev, list: true }));
        setError(null);
        try {
            if (docTab === "my") {
                const data = await fetchMeetingsWithDocs();
                setMeetingsWithDocs(data);
            } else {
                const data = await fetchSharedMinutes();
                setSharedMinutes(data);
            }
        } catch (err: unknown) {
            let errorMessage = "문서 목록 조회 중 오류가 발생했습니다.";
            if (err instanceof Error) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setMinutesLoading((prev) => ({ ...prev, list: false }));
        }
    };

    const submitContract = async () => {
        setBusy(true);
        setError(null);
        try {
            const user = await getUser();
            const recipientInfo: RecipientInfo = recipientData;
            const userInfo: UserInfo = { name: user!.name, email: user!.email, phoneNumber: user!.phone! };
            const documentTitle = `${recipientInfo.name}님의 전자 계약서`;

            const payload = createContractPayload({
                formData: data,
                recipientInfo,
                userInfo,
                documentTitle,
            });

            await sendContract(payload, eformsignTemplateId, selectedMinuteId);
            setSuccess("계약서가 성공적으로 발송되었습니다.");
            setTimeout(() => {
                closeModal();
            }, 1500);
        } catch (error) {
            console.error("계약서 발송 실패:", error);
            setError("계약서 발송에 실패했습니다.");
        } finally {
            setBusy(false);
        }
    };

    const handleShowDocs = async (meetingId: number) => {
        setError(null);
        if (selectedMeetingId === meetingId) {
            setSelectedMeetingId(null);
            setMinutesOfExpandedMeeting([]);
            return;
        }

        setMinutesLoading((prev) => ({ ...prev, detail: true }));
        try {
            const minutes = await getMinutesForMeeting(String(meetingId));
            setMinutesOfExpandedMeeting(minutes);
            setSelectedMeetingId(meetingId);
        } catch (err: unknown) {
            let errorMessage = "회의록 목록을 불러오는 데 실패했습니다.";
            if (err instanceof Error) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setMinutesLoading((prev) => ({ ...prev, detail: false }));
        }
    };

    const handleMinuteClick = async (meetingId: number, minuteId: number) => {
        setError(null);
        setMinutesLoading((prev) => ({ ...prev, detail: true }));
        try {
            const minuteDetails = await getMinuteDetails(String(meetingId), minuteId);
            setSelectedMinuteContent(minuteDetails.content);
            setSelectedMinuteId(minuteId);
        } catch (err: unknown) {
            let errorMessage = "회의록 정보를 불러오는 데 실패했습니다.";
            if (err instanceof Error) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setMinutesLoading((prev) => ({ ...prev, detail: false }));
        }
    };

    const FormComponent = useMemo(() => contractFormComponents[templateId], [templateId]);

    useEffect(() => {
        loadDocuments();
    }, [docTab]);

    useEffect(() => {
        const formExists = !!contractFormComponents[templateId];
        setIsFormStepRequired(formExists);
        setData(initialContractData[templateId] || {});

        if (formExists) {
            setStep(0);
        } else {
            setStep(1);
        }
    }, [templateId]);

    return (
        <div className="contract-container">
            <div className="form-section">
                <h2>{step === 0 && isFormStepRequired ? "계약서 내용" : "수신자 정보"}</h2>
                {/* {FormComponent ? ( */}
                    <div>
                        <div className="form-steps-viewport">
                            <div className={`form-steps-track step-${step}`}>
                                <div className="form-step">
                                    {isFormStepRequired && FormComponent ? (
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <FormComponent data={data} onChange={handleDataChange} />
                                    </Suspense>
                                    ):( <div></div> )}
                                </div>
                                <div className="form-step">
                                    <div className="form-group">
                                        <label>이름</label>
                                        <TextInput
                                            type="text"
                                            value={recipientData.name}
                                            onChange={(e) => setRecipientData({ ...recipientData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>이메일</label>
                                        <TextInput
                                            type="text"
                                            value={recipientData.email}
                                            onChange={(e) => setRecipientData({ ...recipientData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>전화번호</label>
                                        <TextInput
                                            type="text"
                                            value={recipientData.phoneNumber}
                                            onChange={(e) => setRecipientData({ ...recipientData, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="form-navigation">
                            <div className="step-buttons">
                                {isFormStepRequired && step === 1 && (
                                    <button className="contract-button contract-prev" onClick={() => setStep(0)}>
                                        <IconArrowLeft />
                                    </button>
                                )}
                                {isFormStepRequired && step === 0 && (
                                    <button className="contract-button contract-next" onClick={() => setStep(1)}>
                                        <IconArrowRight />
                                    </button>
                                )}
                            </div>
                            <div className="submit-button-wrapper">
                                <SlideToSubmitButton onSubmit={submitContract} disabled={!isFormValid} loading={busy} />
                            </div>
                        </div>
                    </div>
                {/* ) : (
                    <div>유효하지 않은 계약서 템플릿입니다. (ID: {templateId})</div>
                )} */}
            </div>
            <div className="content-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2>회의록 가져오기</h2>
                    {selectedMinuteContent && (
                        <button
                            className="back-button"
                            onClick={() => {
                                setSelectedMinuteContent(null);
                                setSelectedMinuteId(null);
                            }}>
                            <IconArrowLeft /> 목록으로
                        </button>
                    )}
                </div>

                <div className="content-body">
                    <CustomSwitch options={docTabOptions} value={docTab} onChange={setDocTab} />
                    <div style={{ marginTop: "1rem" }}>
                        {selectedMinuteContent ? (
                            <div className="minute-content-display">
                                {minutesLoading.detail ? (
                                    <p>회의록 내용 로딩 중...</p>
                                ) : (
                                    <pre>
                                        <Markdown>{selectedMinuteContent}</Markdown>
                                    </pre>
                                )}
                            </div>
                        ) : minutesLoading.list ? (
                            <div>목록을 불러오는 중...</div>
                        ) : docTab === "my" ? (
                            <ul className="meeting-list">
                                {meetingsWithDocs.map((meeting) => (
                                    <li key={meeting.meetingId} className="meeting-item">
                                        <div className="meeting-title" onClick={() => handleShowDocs(meeting.meetingId)}>
                                            {meeting.meetingTitle}
                                        </div>
                                        {selectedMeetingId === meeting.meetingId && (
                                            <div className="minute-list-container">
                                                {minutesLoading.detail ? (
                                                    <p>회의록 목록 로딩 중...</p>
                                                ) : (
                                                    <div>
                                                        {minutesOfExpandedMeeting.length > 0 ? (
                                                            minutesOfExpandedMeeting.map((minute) => (
                                                                <div
                                                                    key={minute.minuteId}
                                                                    className="minute-item"
                                                                    onClick={() => handleMinuteClick(meeting.meetingId, minute.minuteId)}>
                                                                    {minute.type === "AUTO" && (
                                                                        <div>
                                                                            <IconAutoREC />
                                                                            <p>대화 기록</p>
                                                                        </div>
                                                                    )}
                                                                    {minute.type === "SELF" && (
                                                                        <div>
                                                                            <IconPancil />
                                                                            <p>수동 회의록</p>
                                                                        </div>
                                                                    )}
                                                                    {minute.type === "SUMMARY" && (
                                                                        <div>
                                                                            <IconAISummary />
                                                                            <p>AI 요약본</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p>작성된 회의록이 없습니다.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <ul className="meeting-list">
                                {sharedMinutes.map((minute) => (
                                    <li
                                        key={minute.minuteId}
                                        className="minute-item"
                                        onClick={() => handleMinuteClick(minute.meetingId, minute.minuteId)}>
                                        <div>
                                            <FileTextIcon />
                                            <p>{minute.meetingTitle}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            {success && <Toast message={success} onClose={() => setSuccess(null)} type="success" />}
            {error && <Toast message={error} onClose={() => setError(null)} type="error" />}
        </div>
    );
};

export default ContractContent;
