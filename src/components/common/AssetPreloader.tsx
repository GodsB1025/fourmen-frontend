import { CreateIcon, JoinIcon, ContractIcon, DashboardIcon } from "./LobbyIcons";

// 이 컴포넌트는 화면에 보이지 않는 숨겨진 컨테이너를 렌더링합니다.
// 브라우저는 이 컨테이너 안에 있는 SVG들을 미리 렌더링하여 캐시에 저장합니다.
const AssetPreloader = () => {
    return (
        <div
            style={{
                position: "absolute",
                width: 0,
                height: 0,
                overflow: "hidden",
                opacity: 0,
                pointerEvents: "none", // 클릭 등 이벤트 방지
            }}>
            <CreateIcon />
            <JoinIcon />
            <ContractIcon />
            <DashboardIcon />
        </div>
    );
};

export default AssetPreloader;
