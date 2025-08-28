import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Modal from "../../components/modal/Modal";
import CreateMeetingContent from "../../components/modal/CreateMeetingContent";
import JoinMeetingContent from "../../components/modal/JoinMeetingContent";
import AiAssistantContent from "../../components/modal/AiAssistantContent";
import "./PrivateLayout.css";
import { useModalStore } from "../../stores/modalStore";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import ContractContent from "../../components/modal/ContractContent";
import { PATH } from "../../types/paths";
import { AnimatePresence } from "framer-motion";
import CreateSharingURLContent from "../../components/modal/CreateSharingURLContent";

const PrivateLayout = () => {
    const { activeModal, modalData, openModal, closeModal } = useModalStore();
    const { user } = useAuthStore();
    const { connectAndFetch, disconnect } = useChatStore();
    const navigate = useNavigate();
    const location = useLocation();
    // 현재 경로가 화상회의실인지 확인
    const isVideoRoom = location.pathname.startsWith(PATH.VIDEO_ROOM.split("/:")[0]);

    useEffect(() => {
        if (user?.company) {
            connectAndFetch(); // 통합된 함수 호출
        }
        return () => {
            if (user?.company) {
                disconnect();
            }
        };
    }, [user, connectAndFetch, disconnect]);

    const getModalTitle = () => {
        switch (activeModal) {
            case "create":
                return "새 회의 생성";
            case "join":
                return "회의 참여";
            case "contractForm":
                return "전자 계약서 작성";
            case "aiAssistant":
                return "AI 비서";
            case "sharingURL":
                return "공유 URL 생성"
            default:
                return "";
        }
    };

    const renderModalContent = () => {
        switch (activeModal) {
            case "create":
                return <CreateMeetingContent />;
            case "join":
                return <JoinMeetingContent />;
            case "contractForm":
                return modalData?.templateId && modalData?.eformsignTemplateId ? (
                    <ContractContent templateId={modalData.templateId} eformsignTemplateId={modalData.eformsignTemplateId} />
                ) : null;
            case "aiAssistant": // AI 비서 모달 컨텐츠 렌더링 추가
                return <AiAssistantContent/>;
            case "sharingURL":
                return modalData?.sharingURL && (
                    <CreateSharingURLContent sharingURL={modalData?.sharingURL}/>
                )
            default:
                return null;
        } 
    };

    return (
        <div className="layout-container">
            {/* 화상회의실이 아닐 때만 사이드바를 렌더링 */}
            {!isVideoRoom && (
                <Sidebar
                    onNavigate={(path: string) => navigate(path)}
                    activeKey={location.pathname}
                    onOpenCreateModal={() => openModal("create")}
                    onOpenJoinModal={() => openModal("join")}
                    onOpenAiAssistantModal={() => openModal("aiAssistant")}
                />
            )}
            <main className={`layout-content ${isVideoRoom ? "full-width" : ""}`}>
                <Outlet />
            </main>

            <AnimatePresence>
                {activeModal !== null && (
                    <Modal key={activeModal} onClose={closeModal} title={getModalTitle()}>
                        {renderModalContent()}
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrivateLayout;
