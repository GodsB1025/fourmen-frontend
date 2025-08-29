import React, { useEffect } from 'react';
import './Toast.css';

// Toast 컴포넌트가 받을 props 타입 정의
interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;              // 표시될 시간 (ms), 기본값 3000ms
  type?: 'success' | 'error' | 'info'; // Toast 타입 (스타일 변경용), 기본값 'error'
}

const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  duration = 2000,
  type = 'error',
}) => {

  // duration 시간이 지나면 onClose 함수를 호출하여 컴포넌트를 사라지게 함
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // 컴포넌트가 사라지기 전에 타이머를 정리
    return () => {
      clearTimeout(timer);
    };
  }, [onClose, duration]);

  // type에 따라 적절한 CSS 클래스를 적용
  const toastClassName = `toast-container toast-${type}`;

  return (
    <div className={toastClassName}>
      {message}
    </div>
  );
};

export default Toast;