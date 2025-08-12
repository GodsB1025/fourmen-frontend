import React from 'react';
import './ActionButton.css';

// ActionButton 컴포넌트가 받을 props 타입 정의
interface ActionButtonProps {
    isActive: boolean;
    type?: 'button' | 'submit' | 'reset';
    children: React.ReactNode; //버튼 내부에 표시될 내용 (텍스트말고 아이콘도 가능)
    className?: string;
    onClick?: () => void; // 이벤트 객체가 필요 없으므로 이벤트객체 명시 필요 x
}

const ActionButton = ({
    isActive,
    type = 'button',
    children,
    className,
    onClick,
}: ActionButtonProps) => {

    // 전달받은 className과 기본 클래스를 조합
    const buttonClassName = `action-button ${isActive ? 'active' : ''} ${className || ''}`;

    return (
        <button
            type={type}
            className={buttonClassName.trim()} // 양쪽 공백 제거
            disabled={!isActive}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default ActionButton;