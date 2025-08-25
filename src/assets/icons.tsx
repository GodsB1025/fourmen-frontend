interface Props {
    fillColor?: string;
    strokeColor?: string;
    className?: string;
}

export const IconArrowRight = ({ fillColor = "none", strokeColor = "currentColor" }: Props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={fillColor}
            stroke={strokeColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-arrow-right-icon lucide-arrow-right">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
};

export const IconLongArrowRight = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right"
        >
            <path stroke="none" d="M0 0h30v24H0z" fill="none"/>
            <path d="M-1 12l24 0" />
            <path d="M20 16l4 -4" />
            <path d="M20 8l4 4" />
        </svg>
    )
}

export const IconArrowLeft = ({ fillColor = "none", strokeColor = "currentColor" }: Props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={fillColor}
            stroke={strokeColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-arrow-right-icon lucide-arrow-right">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </svg>
    );
};

export const IconAutoREC = ({ fillColor = "none", strokeColor = "currentColor" }: Props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={fillColor}
            stroke={strokeColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-disc-icon lucide-disc">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="2" fill={strokeColor} />
        </svg>
    );
};

export const IconPancil = ({ fillColor = "none", strokeColor = "currentColor" }: Props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={fillColor}
            stroke={strokeColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-pencil-line-icon lucide-pencil-line">
            <path d="M13 21h8" />
            <path d="m15 5 4 4" />
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
        </svg>
    );
};

export const IconAISummary = ({ fillColor = "none", strokeColor = "currentColor" }: Props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={fillColor}
            stroke={strokeColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-sparkles-icon lucide-sparkles">
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
            <path d="M20 2v4" />
            <path d="M22 4h-4" />
            <circle cx="4" cy="20" r="2" />
        </svg>
    );
};

export const FolderIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
);
export const FileTextIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);
export const BriefcaseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
);
export const ShareIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
);

export const IconCopy = ({ fillColor = "none", strokeColor = "currentColor" }: Props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={fillColor}
            stroke={strokeColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-copy-icon lucide-copy">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
    );
};

export const IconShare = ({
    fillColor="none",
    strokeColor="currentColor"
} : Props) => {
    return ( 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={fillColor}
                stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                className="lucide lucide-share2-icon lucide-share-2"
            >
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
                <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
            </svg>
    )
}

export const IconPaperAirplane = ({
    fillColor="none",
    strokeColor="currentColor"
} : Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={fillColor}
            stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className="lucide lucide-send-horizontal-icon lucide-send-horizontal"
        >
            <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z"/>
            <path d="M6 12h16"/>
        </svg>
    )
}

export const IconHashTag = ({
    fillColor="none",
    strokeColor="currentColor"
} : Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={fillColor}
            stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className="lucide lucide-hash-icon lucide-hash"
        >
            <line x1="4" x2="20" y1="9" y2="9"/>
            <line x1="4" x2="20" y1="15" y2="15"/>
            <line x1="10" x2="8" y1="3" y2="21"/>
            <line x1="16" x2="14" y1="3" y2="21"/>
        </svg>
    )
}

export const IconUserSearch = ({
    fillColor="none",
    strokeColor="currentColor"
} : Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={fillColor}
            stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className="lucide lucide-user-round-search-icon lucide-user-round-search"
        >
            <circle cx="10" cy="8" r="5"/>
            <path d="M2 21a8 8 0 0 1 10.434-7.62"/>
            <circle cx="18" cy="18" r="3"/>
            <path d="m22 22-1.9-1.9"/>
        </svg>
    )
}

export const IconPlus = ({
    fillColor="none",
    strokeColor="currentColor",
    className=""
} : Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fillColor}
            stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className={`lucide lucide-plus-icon lucide-plus ${className}`}
        >
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
        </svg>
    )
}

export const IconChevronUp = ({
    fillColor="none",
    strokeColor="currentColor",
} : Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="auto" viewBox="0 0 24 24" fill={fillColor}
            stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className="lucide lucide-chevron-up-icon lucide-chevron-up"
        >
            <path d="m18 15-6-6-6 6"/>
        </svg>
    )
}

export const IconUser = () => {
    return (
        <svg width="170px" height="auto" stroke-width="1.5" viewBox="0 0 24 24" fill="none" 
            xmlns="http://www.w3.org/2000/svg" color="#000000"
        >
                <path d="M5 20V19C5 15.134 8.13401 12 12 12V12C15.866 12 19 15.134 19 19V20" 
                    stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                    stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    )
}

export const IconUserPro = () => {
    return (
        <svg width="170px" height="auto" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000">
            <path d="M2 20V19C2 15.134 5.13401 12 9 12V12" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M15.8038 12.3135C16.4456 11.6088 17.5544 11.6088 18.1962 12.3135V12.3135C18.5206 12.6697 18.9868 12.8628 19.468 12.8403V12.8403C20.4201 12.7958 21.2042 13.5799 21.1597 14.532V14.532C21.1372 15.0132 21.3303 15.4794 21.6865 15.8038V15.8038C22.3912 16.4456 22.3912 17.5544 21.6865 18.1962V18.1962C21.3303 18.5206 21.1372 18.9868 21.1597 19.468V19.468C21.2042 20.4201 20.4201 21.2042 19.468 21.1597V21.1597C18.9868 21.1372 18.5206 21.3303 18.1962 21.6865V21.6865C17.5544 22.3912 16.4456 22.3912 15.8038 21.6865V21.6865C15.4794 21.3303 15.0132 21.1372 14.532 21.1597V21.1597C13.5799 21.2042 12.7958 20.4201 12.8403 19.468V19.468C12.8628 18.9868 12.6697 18.5206 12.3135 18.1962V18.1962C11.6088 17.5544 11.6088 16.4456 12.3135 15.8038V15.8038C12.6697 15.4794 12.8628 15.0132 12.8403 14.532V14.532C12.7958 13.5799 13.5799 12.7958 14.532 12.8403V12.8403C15.0132 12.8628 15.4794 12.6697 15.8038 12.3135V12.3135Z" stroke="#000000" stroke-width="1.5"></path>
            <path d="M15.3636 17L16.4546 18.0909L18.6364 15.9091" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M9 12C11.2091 12 13 10.2091 13 8C13 5.79086 11.2091 4 9 4C6.79086 4 5 5.79086 5 8C5 10.2091 6.79086 12 9 12Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
    )
}