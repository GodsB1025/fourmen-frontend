import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Modal from "../../components/modal/Modal";
import CreateMeetingContent from "../../components/modal/CreateMeetingContent";
import JoinMeetingContent from "../../components/modal/JoinMeetingContent";
import "./PrivateLayout.css";
import { useModalStore } from "../../stores/modalStore";
import ContractContent from "../../components/modal/ContractContent";
import { PATH } from "../../types/paths";

const PrivateLayout = () => {
    const { activeModal, modalData, openModal, closeModal } = useModalStore();
    const navigate = useNavigate();
    const location = useLocation();

    // 현재 경로가 화상회의실인지 확인
    const isVideoRoom = location.pathname.startsWith(PATH.VIDEO_ROOM.split("/:")[0]);

    const getModalTitle = () => {
        switch (activeModal) {
            case "create":
                return "새 회의 생성";
            case "join":
                return "회의 참가";
            case "contractForm":
                return "전자 계약서 작성";
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
                />
            )}
            <main className={`layout-content ${isVideoRoom ? "full-width" : ""}`}>
                <Outlet />
            </main>

            <Modal isOpen={activeModal !== null} onClose={closeModal} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default PrivateLayout;
