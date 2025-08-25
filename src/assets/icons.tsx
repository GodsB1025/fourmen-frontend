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