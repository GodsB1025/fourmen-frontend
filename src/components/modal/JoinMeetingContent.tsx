import "./JoinMeetingContent.css";
import { useEffect, useMemo, useState } from "react";
import { getMeetings, getMeetingInfo } from "../../apis/Meeting";
import type { Meeting } from "../../apis/Types";
import MeetingRoomList from "./MeetingRoomList";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../types/paths";
import { useModalStore } from "../../stores/modalStore";
import CustomSwitch from "../common/CustomSwitch";
import Toast from "../common/Toast"; // Toast 컴포넌트 import
import { useAuthStore } from "../../stores/authStore";

const JoinMeetingContent = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user)
    const closeModal = useModalStore((state) => state.closeModal);

    const [selectedOption, setSelectedOption] = useState("my");
    const [meetingRooms, setMeetingRooms] = useState<Meeting[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [joiningId, setJoiningId] = useState<number | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const options = user?.company === null
        ?[{ value: "my", label: "내 회의", disabled: false },]
        :[
            { value: "my", label: "내 회의", disabled: false },
            { value: "company", label: "회사 회의", disabled: false },
        ];

    const handleChange = (value: string) => {
        setSelectedOption(value);
    };

    const navigateMeetingRoom = async (meetingId: number) => {
        setJoiningId(meetingId);
        try {
            await getMeetingInfo(meetingId.toString());
            const destination = PATH.VIDEO_ROOM.replace(":meetingId", meetingId.toString());
            navigate(destination);
            closeModal();
        } catch (err: unknown) {
            const errorMessage = "회의에 참가할 권한이 없습니다.";

            setError(errorMessage);
        } finally {
            setJoiningId(null);
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
                const errorMessage = "회의 목록 조회 중 오류가 발생했습니다.";

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
                <CustomSwitch options={options} value={selectedOption} onChange={handleChange} />
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

            <MeetingRoomList busy={busy} error={error} meetingRooms={filteredMeetingRooms} handleClick={navigateMeetingRoom} joiningId={joiningId} />
            {error && <Toast message={error} onClose={() => setError(null)} type="error" />}
        </div>
    );
};

export default JoinMeetingContent;
