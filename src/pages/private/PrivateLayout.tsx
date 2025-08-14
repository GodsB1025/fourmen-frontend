import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Modal from '../../components/modal/Modal';
import CreateMeetingContent from '../../components/modal/CreateMeetingContent';
import JoinMeetingContent from '../../components/modal/JoinMeetingContent';
import './PrivateLayout.css';
import { useModalStore } from '../../stores/modalStore';
import { useAuthStore } from '../../stores/authStore';

const PrivateLayout = () => {
    const { activeModal, openModal, closeModal } = useModalStore();

    const navigate = useNavigate();
    const location = useLocation();

    const dummyUser = {
        name: "홍길동",
        email: "test@email.com",
    };

    const getModalTitle = () => {
        switch (activeModal) {
            case 'create':
                return '새 회의 생성';
            case 'join':
                return '회의 참가';
            default:
                return '';
        }
    };

    // 모달 상태에 따라 다른 컨텐츠 컴포넌트를 반환
    const renderModalContent = () => {
        switch (activeModal) {
            case 'create':
                return <CreateMeetingContent />;
            case 'join':
                return <JoinMeetingContent />;
            default:
                return null;
        }
    };

    return (
        <div className="layout-container">
            <Sidebar 
                userName={dummyUser.name}
                userEmail={dummyUser.email}
                onLogout={() => console.log('로그아웃 클릭됨')}
                onNavigate={(path: string) => {
                    navigate(path);
                }}
                activeKey={location.pathname}
                onOpenCreateModal={() => openModal('create')}
                onOpenJoinModal={() => openModal('join')}
            />
            <main className="layout-content">
                <Outlet />
            </main>

            <Modal
                isOpen={activeModal !== null}
                onClose={() => closeModal()}
                title={getModalTitle()}
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default PrivateLayout;