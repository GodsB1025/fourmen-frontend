interface Props {
    fillColor?: string
    strokeColor?: string
}

export const IconArrowRight = ({
    fillColor="none", 
    strokeColor="currentColor"
} : Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fillColor}
            stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className="lucide lucide-arrow-right-icon lucide-arrow-right"
        >
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
        </svg>
    )
}

export const IconArrowLeft = ({
    fillColor="none", 
    strokeColor="currentColor"
} : Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fillColor}
            stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className="lucide lucide-arrow-right-icon lucide-arrow-right"
        >
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
        </svg>
    )
}

export const IconAutoREC = ({
    fillColor="none",
    strokeColor="currentColor"
} : Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={fillColor}
            stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className="lucide lucide-disc-icon lucide-disc"
        >
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="2" fill={strokeColor}/>
        </svg>
    )
}

export const IconPancil = ({
    fillColor="none",
    strokeColor="currentColor"
} : Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fillColor} 
            stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className="lucide lucide-pencil-line-icon lucide-pencil-line"
        >
            <path d="M13 21h8"/>
            <path d="m15 5 4 4"/>
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
        </svg>
    )
}

export const IconAISummary = ({
    fillColor="none",
    strokeColor="currentColor"
} : Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fillColor}
            stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className="lucide lucide-sparkles-icon lucide-sparkles"
        >
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
            <path d="M20 2v4"/>
            <path d="M22 4h-4"/>
            <circle cx="4" cy="20" r="2"/>
        </svg>
    )
}

export const IconCopy = ({
    fillColor="none",
    strokeColor="currentColor"
} : Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fillColor}
            stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            className="lucide lucide-copy-icon lucide-copy"
        >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
    )
}

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