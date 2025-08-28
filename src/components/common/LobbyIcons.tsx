// ✅ '문이 열리는' 모양의 아이콘으로 변경
export const JoinIcon = () => (
    <svg viewBox="0 0 24 24" fill="none">
        <path
            d="M16 14V11C16 10.4477 15.5523 10 15 10H8M8 10L11 7M8 10L11 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            color="#fff"
        />
        <path
            d="M8 4H18C18.5523 4 19 4.44772 19 5V19C19 19.5523 18.5523 20 18 20H8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            color="#fff"
        />
    </svg>
);

export const ContractIcon = ({
    strokeColor = "currentColor"
}) => (
    // width와 height 속성 제거
    <svg viewBox="0 0 24 24">
        <path
            d="M8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3m-4 0a4 4 0 0 1-4-4h8a4 4 0 0 1-4 4Z"
            stroke={strokeColor}
            strokeWidth="1.5"
            fill="none"
            color="#fff"
        />
    </svg>
);

export const DashboardIcon = () => (
    // width와 height 속성 제거
    <svg viewBox="0 0 24 24">
        <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" stroke="currentColor" strokeWidth="1.5" fill="none" color="#fff" />
    </svg>
);
