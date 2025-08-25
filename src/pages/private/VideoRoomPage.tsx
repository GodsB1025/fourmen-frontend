import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createMeetingURL,
    disableMeetingRoom,
    getMeetingInfo,
    getMeetingURL,
    getMinutesForMeeting,
    getMinuteDetails,
    submitManualMinute,
    updateManualMinute,
    createSharingMeetingURL,
} from "../../apis/Meeting";
import type { Meeting, ManualMinuteResponse, CreateMeetingURLRequest } from "../../apis/Types";
import { PATH } from "../../types/paths";
import "./VideoRoomPage.css";
import { useAuthStore } from "../../stores/authStore";
import { useModalStore } from "../../stores/modalStore";
import Toast from "../../components/common/Toast";
import { IconShare } from "../../assets/icons";

// STT 데이터 타입 정의
interface SttData {
    sttId: number;
    speaker: string;
    text: string;
    timestamp: string;
}

const VideoRoomPage = () => {
    const navigate = useNavigate();
    const { meetingId } = useParams<{ meetingId: string }>();
    const user = useAuthStore((state) => state.user);
    const openModal = useModalStore((state) => state.openModal)

    // --- State Management ---
    const [meetingInfo, setMeetingInfo] = useState<Meeting | null>(null);
    const [videoURL, setVideoURL] = useState<string>("");
    const [sharingVideoURL, setSharingVideoURL] = useState<string>("")
    const [isMinutesVisible, setIsMinutesVisible] = useState(false);

    // 수동 회의록
    const [isWritingMinute, setIsWritingMinute] = useState(false);
    const [manualMinuteId, setManualMinuteId] = useState<number | null>(null);
    const [manualMinuteContent, setManualMinuteContent] = useState("");

    // AI 회의록 (STT)
    const [isRecording, setIsRecording] = useState(false);
    const [sttResults, setSttResults] = useState<SttData[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState({ video: false, minute: false });

    // --- Refs for WebSocket and Media ---
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    // --- Data Loading Effect ---
    useEffect(() => {
        if (!meetingId) return;
        const loadMeetingData = async () => {
            try {
                const info = await getMeetingInfo(meetingId);
                setMeetingInfo(info);

                const minutes = await getMinutesForMeeting(meetingId);
                const manualMinuteInfo = minutes.find((m) => m.type === "SELF");

                if (manualMinuteInfo) {
                    const details = await getMinuteDetails(meetingId, manualMinuteInfo.minuteId);
                    setManualMinuteId(details.minuteId);
                    setManualMinuteContent(details.content);
                }
            } catch (err: any) {
                setError(err.message || "회의 정보를 불러오는 중 오류가 발생했습니다.");
            }
        };
        loadMeetingData();

        // 컴포넌트 언마운트 시 모든 스트리밍 및 녹음 정리
        return () => {
            stopRecordingAndStreaming();
        };
    }, [meetingId]);

    // --- Main Action Handlers ---
    const handleVideoAction = async () => {
        if (!meetingId || !meetingInfo) return;
        setBusy((prev) => ({ ...prev, video: true }));
        try {
            let response;
            if (meetingInfo.roomId) {
                response = await getMeetingURL(meetingId);
            } else {
                const payload: CreateMeetingURLRequest = {
                    description: meetingInfo.title,
                    password: "",
                    manuallyApproval: true,
                    canAutoRoomCompositeRecording: true,
                    scheduledAt: meetingInfo.scheduledAt,
                };
                response = await createMeetingURL(meetingId, payload);
                const updatedInfo = await getMeetingInfo(meetingId);
                setMeetingInfo(updatedInfo);
            }
            setVideoURL(response.embedUrl || response.videoMeetingUrl);
        } catch (err: any) {
            setError(err.message || "화상회의 처리 중 오류가 발생했습니다.");
        } finally {
            setBusy((prev) => ({ ...prev, video: false }));
        }
    };

    const handleSaveOrUpdateMinute = async () => {
        if (!meetingId || !manualMinuteContent.trim()) return;
        setBusy((prev) => ({ ...prev, minute: true }));
        try {
            const action = manualMinuteId ? updateManualMinute : submitManualMinute;
            const updatedMinute = await action(meetingId, manualMinuteId!, manualMinuteContent);

            if (!manualMinuteId) setManualMinuteId(updatedMinute.minuteId);
            setIsWritingMinute(false);
        } catch (err: any) {
            setError(err.message || "회의록 저장에 실패했습니다.");
        } finally {
            setBusy((prev) => ({ ...prev, minute: false }));
        }
    };

    const handleEndMeeting = async () => {
        if (!meetingId || !window.confirm("정말로 회의를 종료하시겠습니까?")) return;
        try {
            await disableMeetingRoom(meetingId);
            alert("회의가 종료되었습니다.");
            navigate(PATH.COMMANDER);
        } catch (err: any) {
            setError(err.message || "회의 종료에 실패했습니다.");
        }
    };

    // --- AI Recording Logic ---
    const stopRecordingAndStreaming = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSING) {
            socketRef.current.close(1000, "Recording stopped");
        }
        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
        socketRef.current = null;
        setIsRecording(false);
    };

    const startRecordingAndStreaming = async () => {
        if (!meetingId) {
            setError("회의 ID가 없어 AI 기록을 시작할 수 없습니다.");
            return;
        }
        setIsRecording(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const apiUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            const url = new URL(apiUrl);
            const wsProtocol = url.protocol === "https:" ? "wss" : "ws";
            const wsURL = `${wsProtocol}://${url.host}/api/ws/audio/${meetingId}`;

            const socket = new WebSocket(wsURL);
            socketRef.current = socket;

            socket.onopen = () => {
                const options = { mimeType: "audio/webm;codecs=opus" };
                const mediaRecorder = new MediaRecorder(stream, options);
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0 && socket?.readyState === WebSocket.OPEN) {
                        socket.send(event.data);
                    }
                };
                mediaRecorder.start(400); // 0.4초 간격으로 데이터 전송
            };

            socket.onmessage = (event) => {
                try {
                    const result = JSON.parse(event.data);
                    if (Array.isArray(result.data)) {
                        setSttResults((prev) => [...prev, ...result.data]);
                    }
                } catch (e) {
                    console.error("STT 메시지 파싱 오류:", e);
                }
            };

            socket.onerror = () => setError("AI 기록 서버 연결에 실패했습니다.");
            socket.onclose = () => stopRecordingAndStreaming();
        } catch (err) {
            setError("마이크 접근에 실패했습니다. 권한을 확인해주세요.");
            setIsRecording(false);
        }
    };

    const handleRecordButtonClick = () => {
        isRecording ? stopRecordingAndStreaming() : startRecordingAndStreaming();
    };

    const openModalShareURL = async () => {
        if(sharingVideoURL!=="") {
            openModal("sharingURL", { sharingURL: sharingVideoURL })
            return
        }
        if(meetingId) {
            try {
                setError(null)
                const url = await createSharingMeetingURL(meetingId)
                setSharingVideoURL(url)

                openModal("sharingURL", { sharingURL: sharingVideoURL })
            } catch (err: unknown) {
                let errorMessage = "공유 URL 생성에 실패했습니다."
                if(err instanceof Error) errorMessage = err.message
                setError(errorMessage)
            } finally {
                // setBusy()
            }
        } else {
            setError("meetingId가 없습니다.")
        }
    }

    // --------------------------------- JSX ------------------------------------
    return (
        <div className={`videoroom-layout ${isMinutesVisible ? "show-minutes" : ""}`}>
            <header className="videoroom-top-bar">
                <div className="title-section">
                    <h1>{meetingInfo?.title}</h1>
                    <span>{meetingInfo ? new Date(meetingInfo.scheduledAt).toLocaleString() : "..."}</span>
                </div>
                <div className="actions-section">
                    <button
                        className="btn btn-sharing"
                        onClick={openModalShareURL}
                    >
                        Share<IconShare/>
                    </button>
                    {meetingInfo?.useAiMinutes && (
                        <button 
                            onClick={handleRecordButtonClick} 
                            className={`btn btn-ai ${isRecording ? "recording" : ""}`}
                        >
                            {isRecording ? "AI 기록 중지" : "AI 기록 시작"}
                        </button>
                    )}
                    {user?.userId === meetingInfo?.hostId && (
                        <button
                            onClick={handleEndMeeting} 
                            className="btn btn-danger"
                        >
                            회의 종료
                        </button>
                    )}
                    <button 
                        onClick={() => navigate(PATH.COMMANDER)} 
                        className="btn btn-secondary"
                    >
                        나가기
                    </button>
                </div>
            </header>

            <main className="videoroom-main-content">
                <div className="video-wrapper">
                    {videoURL ? (
                        <iframe src={videoURL} allow="camera; microphone; fullscreen; speaker; display-capture" title="Video Meeting" />
                    ) : (
                        <div className="placeholder">
                            <h2>화상회의가 시작되지 않았습니다</h2>
                            <button onClick={handleVideoAction} disabled={busy.video || !meetingInfo} className="btn btn-primary btn-xl">
                                {busy.video ? "처리 중..." : meetingInfo?.roomId ? "화상회의 참여" : "화상회의 생성"}
                            </button>
                        </div>
                    )}
                </div>

                <div className="minutes-wrapper">
                    <div className="minutes-header">
                        <h3>수동 회의록</h3>
                        {isWritingMinute ? (
                            <div className="editor-controls">
                                <button onClick={() => setIsWritingMinute(false)} className="btn btn-secondary">
                                    취소
                                </button>
                                <button onClick={handleSaveOrUpdateMinute} disabled={busy.minute} className="btn btn-primary">
                                    저장
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setIsWritingMinute(true)} className="btn btn-secondary">
                                {manualMinuteId ? "수정하기" : "작성하기"}
                            </button>
                        )}
                    </div>
                    <div className="minutes-body">
                        {isWritingMinute ? (
                            <textarea
                                value={manualMinuteContent}
                                onChange={(e) => setManualMinuteContent(e.target.value)}
                                placeholder="회의 내용을 작성하세요..."
                            />
                        ) : (
                            <pre className="saved-content">{manualMinuteContent.trim() || "작성된 회의록이 없습니다."}</pre>
                        )}
                    </div>
                </div>
            </main>

            <footer className="videoroom-footer">
                <button
                    className={`toggle-minutes-btn ${isMinutesVisible ? "active" : ""}`}
                    onClick={() => setIsMinutesVisible(!isMinutesVisible)}
                    aria-label={isMinutesVisible ? "회의록 숨기기" : "회의록 작성/보기"}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        <path d="m15 5 4 4" />
                    </svg>
                    <span>{isMinutesVisible ? "숨기기" : "회의록"}</span>
                </button>
            </footer>
            {error && (
                <Toast
                    message={error} 
                    onClose={() => setError(null)}
                    type="error"
                />
            )}
        </div>
    );
};

export default VideoRoomPage;
