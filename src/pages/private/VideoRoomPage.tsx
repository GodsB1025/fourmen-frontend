import type React from "react";
import { useEffect, useRef, useState } from "react";
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
import type { Meeting, CreateMeetingURLRequest } from "../../apis/Types";
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
  const openModal = useModalStore((state) => state.openModal);

  // --- State Management ---
  const [meetingInfo, setMeetingInfo] = useState<Meeting | null>(null);
  const [videoURL, setVideoURL] = useState<string>("");
  const [sharingVideoURL, setSharingVideoURL] = useState<string | null>(null);
  const [isMinutesVisible, setIsMinutesVisible] = useState(false);

  // 수동 회의록
  const [isWritingMinute, setIsWritingMinute] = useState(false);
  const [manualMinuteId, setManualMinuteId] = useState<number | null>(null);
  const [manualMinuteContent, setManualMinuteContent] = useState("");

  // AI 회의록 (STT)
  const [isRecording, setIsRecording] = useState(false);
  // 값은 사용하지 않고 setter만 쓰므로 첫 요소를 버립니다(빌드 시 TS6133 방지).
  const [, setSttResults] = useState<SttData[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState({ video: false, minute: false });

  // --- Refs for WebSocket and Media ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // --- Draggable Footer Refs/State ---
  const footerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // 초기 위치는 CSS에서 설정
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const wasDragged = useRef(false);

  // --- Helpers ---
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

  const loadMeetingData = async (id: string) => {
    try {
      const info = await getMeetingInfo(id);
      setMeetingInfo(info);

      const minutes = await getMinutesForMeeting(id);
      const manualMinuteInfo = minutes.find((m) => m.type === "SELF");

      if (manualMinuteInfo) {
        const details = await getMinuteDetails(id, manualMinuteInfo.minuteId);
        setManualMinuteId(details.minuteId);
        setManualMinuteContent(details.content);
      } else {
        setManualMinuteId(null);
        setManualMinuteContent("");
      }
    } catch (err: unknown) {
      let msg = "회의 정보를 불러오는 중 오류가 발생했습니다.";
      if (err instanceof Error) msg = err.message;
      setError(msg);
    }
  };

  // --- Data Loading Effect ---
  useEffect(() => {
    if (!meetingId) return;
    loadMeetingData(meetingId);

    // 컴포넌트 언마운트 시 모든 스트리밍 및 녹음 정리
    return () => {
      stopRecordingAndStreaming();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  // --- Drag and Drop Effect ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      wasDragged.current = true;
      if (!hasBeenDragged) setHasBeenDragged(true);

      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // 드래그 직후 클릭 이벤트 방지 플래그
      setTimeout(() => {
        wasDragged.current = false;
      }, 0);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, hasBeenDragged]);

  // --- Drag and Drop Handlers ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
  };

  const handleToggleMinutesClick = () => {
    if (wasDragged.current) return; // 드래그 직후 클릭 방지
    setIsMinutesVisible((v) => !v);
  };

  // --- Main Action Handlers ---
  const handleVideoAction = async () => {
    if (!meetingId || !meetingInfo) return;
    setBusy((prev) => ({ ...prev, video: true }));
    try {
      let response: any;
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
        // 방 생성 이후 최신 정보 갱신
        const updatedInfo = await getMeetingInfo(meetingId);
        setMeetingInfo(updatedInfo);
      }
      setVideoURL(response.embedUrl || response.videoMeetingUrl);
    } catch (err: unknown) {
      let msg = "화상회의 처리 중 오류가 발생했습니다.";
      if (err instanceof Error) msg = err.message;
      setError(msg);
    } finally {
      setBusy((prev) => ({ ...prev, video: false }));
    }
  };

  const handleSaveOrUpdateMinute = async () => {
    if (!meetingId || !manualMinuteContent.trim()) return;
    setBusy((prev) => ({ ...prev, minute: true }));
    try {
      if (manualMinuteId) {
        await updateManualMinute(meetingId, manualMinuteId, manualMinuteContent);
      } else {
        const newMinute = await submitManualMinute(meetingId, manualMinuteContent);
        setManualMinuteId(newMinute.minuteId);
      }
      setIsWritingMinute(false);
    } catch (err: unknown) {
      let msg = "회의록 저장에 실패했습니다.";
      if (err instanceof Error) msg = err.message;
      setError(msg);
    } finally {
      setBusy((prev) => ({ ...prev, minute: false }));
    }
  };

  const handleEndMeeting = async () => {
    if (!meetingId || !window.confirm("정말로 회의를 종료하시겠습니까?")) return;
    try {
      await disableMeetingRoom(meetingId);
      setSuccess("회의가 종료되었습니다.");
      setTimeout(() => navigate(PATH.COMMANDER), 1500);
    } catch (err: unknown) {
      let msg = "회의 종료에 실패했습니다.";
      if (err instanceof Error) msg = err.message;
      setError(msg);
    }
  };

  // --- AI Recording Logic ---
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
    } catch {
      setError("마이크 접근에 실패했습니다. 권한을 확인해주세요.");
      setIsRecording(false);
    }
  };

  const handleRecordButtonClick = () => {
    isRecording ? stopRecordingAndStreaming() : startRecordingAndStreaming();
  };

  const openModalShareURL = async () => {
    if (sharingVideoURL) {
      openModal("sharingURL", { sharingURL: sharingVideoURL });
      return;
    }
    if (!meetingId) {
      setError("meetingId가 없습니다.");
      return;
    }
    try {
      setError(null);
      const url = await createSharingMeetingURL(meetingId);
      setSharingVideoURL(url);
      openModal("sharingURL", { sharingURL: url });
    } catch (err: unknown) {
      let msg = "공유 URL 생성에 실패했습니다.";
      if (err instanceof Error) msg = err.message;
      setError(msg);
    }
  };

  // --------------------------------- JSX ------------------------------------
  return (
    <div className={`videoroom-layout ${isMinutesVisible ? "show-minutes" : ""}`}>
      <header className="videoroom-top-bar">
        <div className="title-section">
          <h1>{meetingInfo?.title}</h1>
          <span>
            {meetingInfo ? new Date(meetingInfo.scheduledAt).toLocaleString() : "..."}
          </span>
        </div>

        <div className="actions-section">
          <button className="btn btn-sharing" onClick={openModalShareURL}>
            Share <IconShare />
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
            <button onClick={handleEndMeeting} className="btn btn-danger">
              회의 종료
            </button>
          )}

          <button onClick={() => navigate(PATH.COMMANDER)} className="btn btn-secondary">
            나가기
          </button>
        </div>
      </header>

      <main className="videoroom-main-content">
        <div className="video-wrapper">
          {videoURL ? (
            <iframe
              src={videoURL}
              allow="camera; microphone; fullscreen; speaker; display-capture"
              title="Video Meeting"
            />
          ) : (
            <div className="placeholder">
              <h2>화상회의가 시작되지 않았습니다</h2>
              <button
                onClick={handleVideoAction}
                disabled={busy.video || !meetingInfo}
                className="btn btn-primary btn-xl"
              >
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
              <pre className="saved-content">
                {manualMinuteContent.trim() || "작성된 회의록이 없습니다."}
              </pre>
            )}
          </div>
        </div>
      </main>

      {/* 드래그 가능한 플로팅 푸터(회의록 토글 버튼) */}
      <div
        ref={footerRef}
        className={`videoroom-footer ${isDragging ? "is-dragging" : ""}`}
        onMouseDown={handleMouseDown}
        style={
          hasBeenDragged
            ? { left: `${position.x}px`, top: `${position.y}px`, bottom: "auto", right: "auto" }
            : {}
        }
      >
        <button
          className={`toggle-minutes-btn ${isMinutesVisible ? "active" : ""}`}
          onClick={handleToggleMinutesClick}
          aria-label={isMinutesVisible ? "회의록 숨기기" : "회의록 작성/보기"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            <path d="m15 5 4 4" />
          </svg>
          <span>{isMinutesVisible ? "숨기기" : "회의록"}</span>
        </button>
      </div>

      {success && <Toast message={success} onClose={() => setSuccess(null)} type="success" />}
      {error && <Toast message={error} onClose={() => setError(null)} type="error" />}
    </div>
  );
};

export default VideoRoomPage;
