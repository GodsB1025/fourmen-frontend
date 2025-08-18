import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMeetingURL, disableMeetingRoom, getMeetingInfo, getMeetingURL } from '../../apis/Meeting';
import type { CreateMeetingURLRequest } from '../../apis/Types';
import { PATH } from '../../types/paths';

// 서버로부터 받을 STT 데이터 타입 정의
interface SttData {
  sttId: number;
  speaker: string;
  text: string;
  timestamp: string;
}

const VideoRoomPage = () => {
  const navigate = useNavigate()

  const { meetingId } = useParams<{ meetingId: string }>();

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [videoURL, setVideoURL] = useState<string>("");

  // --- 음성 녹음 및 WebSocket 관련 상태/Ref ---
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  
  // 서버로부터 받은 STT 결과를 저장할 State
  const [sttResults, setSttResults] = useState<SttData[]>([]);

  // --- 모든 리소스 정리 및 상태 초기화 함수 ---
  const stopRecordingAndStreaming = () => {
    console.log("Cleanup: Stopping recording and closing connections.");

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSING) {
      socketRef.current.close(1000, "User clicked stop button");
    }

    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    socketRef.current = null;
    
    setIsRecording(false);
  };

  // --- 녹음 및 WebSocket 전송 시작 함수 ---
  const startRecordingAndStreaming = async () => {
    // 이전 상태 초기화
    setError(null);
    setSttResults([]);

    if (!meetingId) {
      setError("회의 ID가 없어 STT를 시작할 수 없습니다.");
      return;
    }

    setIsRecording(true); // UI 즉시 업데이트

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const apiUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      const url = new URL(apiUrl);
      const wsProtocol = url.protocol === 'https:' ? 'wss' : 'ws';
      const wsURL = `${wsProtocol}://${url.host}/api/ws/audio/${meetingId}`;
      console.log(`Connecting to WebSocket: ${wsURL}`);

      const socket = new WebSocket(wsURL);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket 연결 성공. 녹음을 시작합니다.");
        
        const options = { mimeType: 'audio/webm;codecs=opus' };
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket?.readyState === WebSocket.OPEN) {
            // console.log(`Sending audio data chunk: ${event.data.size} bytes`);
            socket.send(event.data);
          }
        };

        // 400ms 간격으로 데이터를 분할하여 전송 (HTML 예제와 동일)
        mediaRecorder.start(400);
      };

      socket.onmessage = (event) => {
        console.log("⬇️ STT 결과 수신:", event.data);
        try {
            const result = JSON.parse(event.data);
            if (result.result === "SUCCESS" && Array.isArray(result.data)) {
              setSttResults(prevResults => [...prevResults, ...result.data]);
            }
        } catch(e) {
            console.error("수신 메시지 파싱 오류:", e);
        }
      };

      socket.onerror = (event) => {
        console.error('❌ WebSocket 오류:', event);
        setError('웹소켓 연결에 실패했습니다. 서버 상태나 인증 정보를 확인해주세요.');
        stopRecordingAndStreaming();
      };

      socket.onclose = (event) => {
        console.log(`👋 WebSocket 연결 종료: 코드=${event.code}, 이유=${event.reason || '없음'}`);
        stopRecordingAndStreaming();
      };

    } catch (err) {
      console.error('마이크 접근 오류:', err);
      setError('마이크에 접근할 수 없습니다. 권한을 확인해주세요.');
      setIsRecording(false);
    }
  };

  const handleRecordButtonClick = () => {
    if (isRecording) {
      stopRecordingAndStreaming();
    } else {
      startRecordingAndStreaming();
    }
  };

  // 컴포넌트가 언마운트될 때 모든 리소스를 정리
  useEffect(() => {
    return () => {
      stopRecordingAndStreaming();
    };
  }, []);

  // 회의 URL 관련 함수들
  const createURL = async () => {
    setError(null);
    setBusy(true);
    try {
      if(meetingId) {
        const { scheduledAt } = await getMeetingInfo(meetingId);
        const payload : CreateMeetingURLRequest = {
          description: "",
          password: "",
          manuallyApproval: true,
          canAutoRoomCompositeRecording: true,
          scheduledAt: scheduledAt
        };
        const { embedUrl } = await createMeetingURL(meetingId, payload);
        setVideoURL(embedUrl);
      }
    } catch (err : unknown) {
      let errorMessage = "회의 URL 생성 중 오류가 발생했습니다.";
      if(err instanceof Error) errorMessage = err.message;
      setError(errorMessage);
    } finally {
      setBusy(false);
    }
  };

  const loadURL = async () => {
    setError(null);
    setBusy(true);
    try {
      if(meetingId) {
        const { videoMeetingUrl } = await getMeetingURL(meetingId);
        setVideoURL(videoMeetingUrl);
      }
    } catch (err : unknown) {
      let errorMessage = "회의 URL 조회 중 오류가 발생했습니다.";
      if(err instanceof Error) errorMessage = err.message;
      setError(errorMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <iframe
        src={videoURL}
        style={{ width: '100%', height: '80vh', border: 'none' }}
        allow="camera; microphone; fullscreen; speaker; display-capture"
      />

      <br />{meetingId}번 비디오룸입니다.
      <br />
      <button onClick={createURL} disabled={busy}>URL 생성</button>
      <button onClick={loadURL} disabled={busy}>URL 불러오기</button>

      {/* --- 음성 녹음/전송 관련 UI --- */}
      <br/>
      <button onClick={handleRecordButtonClick} disabled={busy}>
        {isRecording ? 'AI 회의록 기록 중지' : 'AI 회의록 기록 시작'}
      </button>
      
      {/* --- 실시간 STT 결과 표시 영역 --- */}
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px', height: '200px', overflowY: 'auto' }}>
        <h4>실시간 회의록</h4>
        {sttResults.length > 0 ? (
          sttResults.map((stt, index) => (
            <p key={`${stt.sttId}-${index}`}>
              <strong>{stt.speaker}</strong> ({stt.timestamp}): {stt.text}
            </p>
          ))
        ) : (
          <p>{isRecording ? "음성을 듣고 있습니다..." : "AI 회의록 기록을 시작하세요."}</p>
        )}
      </div>

      <br/>{meetingId && <button onClick={()=>disableMeetingRoom(meetingId)}>회의 종료</button> }
      <br/><button onClick={()=>navigate(PATH.COMMANDER)}>회의 나가기</button>
      <br/>{error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default VideoRoomPage;