import { type ReactNode } from "react";
import "./Modal.css";
import { motion } from "framer-motion";

type ModalProps = {
    onClose: () => void;
    title?: string;
    children: ReactNode;
};

export default function Modal({ 
    onClose, 
    title = "", 
    children 
}: ModalProps) {
    return (
            <motion.div 
                className="modal-overlay" 
                onMouseDown={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* 실제 모달 컨텐츠, 이벤트 버블링 방지 */}
                <motion.div 
                    className="modal-content"
                    onMouseDown={e => e.stopPropagation()} 
                    onClick={(e) => e.stopPropagation()}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30,
                        duration: 0.3,
                        ease: "easeInOut"
                    }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    // layout
                >
                    <header className="modal-header">
                        <h2 className="modal-title">{title}</h2>
                        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="닫기">
                            &times;
                        </button>
                    </header>
                    <main className="modal-body">
                        {children}
                    </main>
                </motion.div>
            </motion.div>
    );
}