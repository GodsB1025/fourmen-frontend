import React from 'react';
import './SmoothProgressBar.css'; // 애니메이션을 위한 CSS 파일을 불러옵니다.

interface ProgressBarProps {
  // 부모 컴포넌트(SignupWizard)로부터 목표 퍼센트 값을 받습니다.
  targetPercent: number;
}

/**
 * 부드러운 애니메이션 효과가 적용된 진행률 게이지 컴포넌트입니다.
 * 실제 애니메이션은 CSS transition 속성을 통해 처리됩니다.
 */
const SmoothProgressBar: React.FC<ProgressBarProps> = ({ targetPercent }) => {
  return (
    // 게이지의 배경(회색 트랙)이 되는 컨테이너입니다.
    <div className="progress-container">
      {/* 실제 채워지는 파란색 막대입니다. width가 동적으로 변경됩니다. */}
      <div
        className="progress-bar"
        style={{ width: `${targetPercent}%` }}
      />
    </div>
  );
};

export default SmoothProgressBar;
