import { type ReactNode } from "react";
import "./Modal.css";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
};

export default function Modal({ 
    isOpen,
    onClose, 
    title = "", 
    children 
}: ModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        // 모달 오버레이
        <div className="modal-overlay" onClick={onClose}>
            {/* 실제 모달 컨텐츠, 이벤트 버블링 방지 */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                <h2 className="modal-title">{title}</h2>
                <button type="button" className="modal-close-btn" onClick={onClose} aria-label="닫기">
                    &times;
                </button>
                </header>
                <main className="modal-body">
                {children}
                </main>
            </div>
        </div>
    );
}