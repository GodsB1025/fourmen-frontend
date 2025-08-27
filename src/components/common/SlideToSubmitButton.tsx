import React, { useState, useRef, useEffect } from 'react';
import './SlideToSubmitButton.css';
import { IconPaperAirplane } from '../../assets/icons';

interface SlideToSubmitButtonProps {
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const SlideToSubmitButton: React.FC<SlideToSubmitButtonProps> = ({ onSubmit, disabled = false, loading = false }) => {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const handleInteractionStart = (_clientX: number) => {
    if (disabled || loading || isCompleted) return;
    setIsDragging(true);
  };

  const handleInteractionMove = (clientX: number) => {
    if (!isDragging || disabled || loading) return;

    const slider = sliderRef.current;
    const handle = handleRef.current;
    if (!slider || !handle) return;

    const sliderRect = slider.getBoundingClientRect();
    let newX = clientX - sliderRect.left - (handle.offsetWidth / 2);

    // 슬라이드바의 최대 위치 설정
    const maxPosition = slider.offsetWidth - handle.offsetWidth;

    // 경계값 제한
    if (newX < 0) newX = 0;
    if (newX > maxPosition) newX = maxPosition;

    setSliderPosition(newX);
  };

  const handleInteractionEnd = () => {
    if (!isDragging || disabled || loading) return;
    setIsDragging(false);

    const slider = sliderRef.current;
    const handle = handleRef.current;
    if (!slider || !handle) return;

    // 임계값 (예: 95%) 이상 드래그했을 때 완료 처리
    const maxPosition = slider.offsetWidth - handle.offsetWidth;
    const threshold = maxPosition * 0.95;

    if (sliderPosition >= threshold) {
      setIsCompleted(true);
      setSliderPosition(maxPosition); // 끝으로 완전히 이동
      onSubmit(); // 부모 컴포넌트로 전송 이벤트 전달
      setIsCompleted(false);
      setSliderPosition(0);
    } else {
      // 임계값 미만이면 원래 위치로 복귀
      setSliderPosition(0);
    }
  };

  // 마우스 이벤트 핸들러
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleInteractionMove(e.clientX);
    const handleMouseUp = () => handleInteractionEnd();

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, sliderPosition]);

  // 터치 이벤트 핸들러
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => handleInteractionMove(e.touches[0].clientX);
    const handleTouchEnd = () => handleInteractionEnd();
      
    if (isDragging) {
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, sliderPosition]);
  
  const containerClasses = [
    'slider-container',
    disabled ? 'disabled' : '',
    loading ? 'loading' : '',
    isCompleted ? 'completed' : ''
  ].join(' ');
  
  const text = disabled ? "항목을 입력하세요" : loading ? "전송 중..." : "전송하기";

  return (
    <div 
        ref={sliderRef}
        className={containerClasses}
        onMouseDown={(e) => handleInteractionStart(e.clientX)}
        onTouchStart={(e) => handleInteractionStart(e.touches[0].clientX)}
    >
        <div 
            className="slider-handle"
            ref={handleRef}
            style={{ transform: `translateX(${sliderPosition}px)` }}
        >
          <IconPaperAirplane />
        </div>
        <span className="slider-text">{text}</span>
    </div>
  );
};

export default SlideToSubmitButton;