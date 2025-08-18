import { FancySwitch } from '@omit/react-fancy-switch'
import './JoinMeetingContent.css'
import { useEffect, useState } from 'react'
import styles from '../common/FancySwitch.module.css'
import { getMeetings } from '../../apis/Meeting'
import type { Meeting } from '../../apis/Types'
import MeetingRoomList from './MeetingRoomList'
import { useNavigate } from 'react-router-dom'
import { PATH } from '../../types/paths'

const JoinMeetingContent = () => {
    const navigate = useNavigate()

    const [selectedOption, setSelectedOption] = useState('my')
    const [meetingRooms, setMeetingRooms] = useState<Meeting[]>([]);
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false);

    const options = [
        { value: 'my', label: '내 회의', disabled: false },
        { value: 'company', label: '회사 회의', disabled: false },
    ]

    const handleChange = (value) => {
        setSelectedOption(value)
    }

    const navigateMeetingRoom = (meetingId : number) => {
        const destination = PATH.VIDEO_ROOM.replace(':meetingId', meetingId.toString())
        navigate(destination)
    }

    // 컴포넌트가 처음 마운트될 때와 selectedOption이 바뀔 때 회의 목록을 불러옴
    useEffect(() => {
        const fetchMeetings = async () => {
            setBusy(true)
            setError(null)
            try {
                const data = await getMeetings(selectedOption)
                setMeetingRooms(data)
                console.log("조회 데이터 확인:",data)
            } catch (err : unknown) {
                console.error("회의 조회 실패:", err);
                let errorMessage = "회의 목록 조회 중 오류가 발생했습니다."
                if(err instanceof Error)
                    errorMessage = err.message
                setError(errorMessage);
            } finally {
                setBusy(false)
            }
        }

        fetchMeetings()
    }, [selectedOption]);

    return (
        <>
            <FancySwitch
            options={options}
            value={selectedOption}
            onChange={handleChange}
            className={styles.switchContainer}
            radioClassName={styles.radioButton}
            highlighterClassName={styles.highlighter}
            />
            
            {/* form 태그 대신에 meetingRooms state에 따라 다른 값이 출력되는 컴포넌트 구현 */}
            
            <MeetingRoomList
            busy={busy}
            error={error}
            meetingRooms={meetingRooms}
            handleClick={navigateMeetingRoom}
            />
            
            {error && <p>{error}</p>}
        </>
    );
}

export default JoinMeetingContent