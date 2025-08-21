import React from "react";

export const CreateIcon = () => (
    // width와 height 속성 제거
    <svg viewBox="0 0 24 24">
        <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const JoinIcon = () => (
    // width와 height 속성 제거
    <svg viewBox="0 0 24 24">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ContractIcon = () => (
    // width와 height 속성 제거
    <svg viewBox="0 0 24 24">
        <path
            d="M8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3m-4 0a4 4 0 0 1-4-4h8a4 4 0 0 1-4 4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
        />
    </svg>
);

export const DashboardIcon = () => (
    // width와 height 속성 제거
    <svg viewBox="0 0 24 24">
        <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
);
