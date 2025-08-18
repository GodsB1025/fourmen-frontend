import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { createMeetingURL, getMeetingInfo, getMeetingURL } from '../../apis/Meeting';
import type { CreateMeetingURLRequest } from '../../apis/Types';

const VideoRoomPage = () => {
  const { meetingId } = useParams<{ meetingId: string }>();

  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [videoURL, setVideoURL] = useState<string>("")

  const createURL = async () => {
    setError(null)
    setBusy(true)
    try {
      if(meetingId) {
        const { scheduledAt } = await getMeetingInfo(meetingId)
        const payload : CreateMeetingURLRequest = {
          description: "",
          password: "",
          manuallyApproval: true,
          canAutoRoomCompositeRecording: true,
          scheduledAt: scheduledAt
        }

        const { embedUrl } = await createMeetingURL(meetingId, payload)
        setVideoURL(embedUrl)
      }

    } catch (err : unknown) {
      console.error("회의 URL 생성 실패:", err);
      let errorMessage = "회의 URL 생성 중 오류가 발생했습니다."
      if(err instanceof Error)
        errorMessage = err.message
      setError(errorMessage);
    } finally {
      setBusy(false)
    }
  }

  const loadURL = async () => {
    setError(null)
    setBusy(true)
    try {
      if(meetingId) {
        const { videoMeetingUrl } = await getMeetingURL(meetingId)
        setVideoURL(videoMeetingUrl)
      }
    } catch (err : unknown) {
      console.error("회의 URL 조회 실패:", err);
      let errorMessage = "회의 URL 조회 중 오류가 발생했습니다."
      if(err instanceof Error)
        errorMessage = err.message
      setError(errorMessage);
    } finally {
      setBusy(false)
    }
  }

  useEffect(()=>{
    
  }, [])

  // 만약 meetingId를 조회해서 url이 없으면 회의 생성 버튼,
  //  조회했을 때 url이 있다면 회의 참여 버튼이 뜨도록 해야 한다.
  return (
    <div>
      {/* iframe 이긴한데... */}
      <iframe
      src={videoURL}
      style={{ width: '100%', height: '80vh', border: 'none' }}
      />

      <br />{meetingId}번 비디오룸입니다.
      <br />
      <button
      onClick={createURL}
      disabled={busy}>
        URL 생성
      </button>
      <button
      onClick={loadURL}
      disabled={busy}>
        URL 불러오기
      </button>
      <br/>{error && <p>{error}</p>}
    </div>
  )
}

export default VideoRoomPage