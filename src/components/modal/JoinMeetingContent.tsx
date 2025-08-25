import "./JoinMeetingContent.css";
import { useEffect, useMemo, useState } from "react";
import { getMeetings, getMeetingInfo } from "../../apis/Meeting"; // getMeetingInfo import 추가
import type { Meeting } from "../../apis/Types";
import MeetingRoomList from "./MeetingRoomList";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../types/paths";
import { useModalStore } from "../../stores/modalStore";
import CustomSwitch from "../common/CustomSwitch";

const JoinMeetingContent = () => {
    const navigate = useNavigate();
    const closeModal = useModalStore((state) => state.closeModal);

    const [selectedOption, setSelectedOption] = useState("my");
    const [meetingRooms, setMeetingRooms] = useState<Meeting[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [joiningId, setJoiningId] = useState<number | null>(null); // 현재 입장 시도 중인 회의 ID 상태

    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const options = [
        { value: "my", label: "내 회의", disabled: false },
        { value: "company", label: "회사 회의", disabled: false },
    ];

    const handleChange = (value: string) => {
        setSelectedOption(value);
    };

    // 참가 버튼 클릭 시 권한 확인 로직 추가
    const navigateMeetingRoom = async (meetingId: number) => {
        setJoiningId(meetingId); // 입장 시도 상태로 변경
        try {
            // 1. 회의 참가 API를 호출하여 권한 확인
            await getMeetingInfo(meetingId.toString());

            // 2. 권한이 있으면 회의실로 이동
            const destination = PATH.VIDEO_ROOM.replace(":meetingId", meetingId.toString());
            navigate(destination);
            closeModal();
        } catch (err: unknown) {
            // 3. 권한이 없으면 (API 호출 실패 시) 에러 메시지 표시
            let errorMessage = "회의에 참가할 권한이 없습니다."
            if(err instanceof Error) errorMessage = err.message
            alert(errorMessage);
        } finally {
            setJoiningId(null); // 입장 시도 상태 해제
        }
    };

    const filteredMeetingRooms = useMemo(() => {
        if (!searchQuery) {
            return meetingRooms;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return meetingRooms.filter(
            (room) => room.title.toLowerCase().includes(lowercasedQuery) || room.hostName.toLowerCase().includes(lowercasedQuery)
        );
    }, [searchQuery, meetingRooms]);

    useEffect(() => {
        const fetchMeetings = async () => {
            setBusy(true);
            setError(null);
            try {
                const data = await getMeetings(selectedOption);
                setMeetingRooms(data);
            } catch (err: unknown) {
                let errorMessage = "회의 목록 조회 중 오류가 발생했습니다.";
                if (err instanceof Error) errorMessage = err.message;
                setError(errorMessage);
            } finally {
                setBusy(false);
            }
        };

        fetchMeetings();
    }, [selectedOption]);

    return (
        <div className="join-meeting-container">
            <div className="switch-wrapper">
                <CustomSwitch
                    options={options}
                    value={selectedOption}
                    onChange={handleChange}
                />
            </div>

            <div className="search-bar-container">
                <input
                    type="text"
                    placeholder="회의 이름 또는 주최자로 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            <MeetingRoomList
                busy={busy}
                error={error}
                meetingRooms={filteredMeetingRooms}
                handleClick={navigateMeetingRoom}
                joiningId={joiningId} // 입장 시도 중인 회의 ID를 props로 전달
            />
        </div>
    );
};

export default JoinMeetingContent;
