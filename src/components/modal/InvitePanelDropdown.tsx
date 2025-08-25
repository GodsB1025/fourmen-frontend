import React, { useRef, useLayoutEffect, useState, useMemo, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { CompanyMember } from "../../apis/Types";
import { useClickOutside } from "../../utils/useClickOutside";
import "./CreateMeetingContent.css";
import { IconChevronUp, IconPlus, IconUserSearch } from "../../assets/icons";
import { motion } from "framer-motion"

// CreateMeetingContent에서 전달받을 Props 타입 정의
interface InvitePanelDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: RefObject<HTMLDivElement | null>; // 위치 기준으로 삼을 요소의 ref
    initialInvites: string[];
    companyMembers: CompanyMember[];
    currentUserEmail?: string;
    currentParticipants: string[];
    onSelectParticipant: (email: string) => void;
}

const dropdownVariants = {
    hidden: {
        opacity: 0,
        height: 0,
    },
    visible: {
        opacity: 1,
        height: "auto", // 최종 높이를 자동으로 계산
        transition: {
            duration: 0.25,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        height: 0,
        transition: {
            duration: 0.2,
            ease: "easeIn",
        },
    }
} as const;

const InvitePanelDropdown = ({
    isOpen,
    onClose,
    anchorRef,
    initialInvites,
    companyMembers,
    currentUserEmail,
    currentParticipants,
    onSelectParticipant,
}: InvitePanelDropdownProps) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
    const [pendingInvites, setPendingInvites] = useState<Set<string>>(new Set(initialInvites));
    const [searchQuery, setSearchQuery] = useState("");

    // isOpen 상태가 바뀔 때마다 initialInvites로 pendingInvites를 동기화
    useLayoutEffect(() => {
        if (isOpen) {
            setPendingInvites(new Set(initialInvites));
        }
    }, [isOpen, initialInvites]);
    
    // 앵커(기준) 요소의 위치를 계산하여 패널의 위치를 설정
    useLayoutEffect(() => {
        if (isOpen && anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [isOpen, anchorRef]);

    // 패널 외부 클릭 시 닫기
    useClickOutside(panelRef, (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
            return;
        }
        onClose();
    });

    // 검색 및 필터링 로직
    const companyMembersToShow = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        return companyMembers.filter(
            (member) =>
                member.email !== currentUserEmail &&
                !currentParticipants.includes(member.email) && // 현재 참여자 목록에 없는 사람만 필터링
                (member.name.toLowerCase().includes(lowercasedQuery) || member.email.toLowerCase().includes(lowercasedQuery))
        );
    }, [searchQuery, companyMembers, pendingInvites, currentUserEmail]);

    if (!isOpen) return null;

    return createPortal(
        <motion.div
            ref={panelRef}
            className="invite-dropdown-panel"
            style={{
                position: 'absolute',
                top: `${position.top + 8}px`,
                left: `${position.left}px`,
                width: `${position.width}px`,
                overflow: 'hidden',
            }}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <button className="btn-invite-close" onClick={()=>onClose()}><IconChevronUp/></button>
            {companyMembers.length > 0 && (
                <div className="company-member-section">
                    <div className="invite-search">
                        <IconUserSearch strokeColor="#aaa"/>
                        <input type="text" placeholder="팀원 이름 또는 이메일로 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <ul className="member-list">
                        {companyMembersToShow.map((member) => (
                            <li 
                                key={member.id} 
                                className="member-item" 
                                onClick={() => onSelectParticipant(member.email)}
                            >
                                <div className="member-info">
                                    <span className="member-name">{member.name}</span>
                                    <span className="member-email">{member.email}</span>
                                </div>
                                <IconPlus className="add-indicator"/>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </motion.div>,
        document.body
    );
};

export default InvitePanelDropdown;