import React from 'react';
import './SmoothProgressBar.css'; // 애니메이션을 위한 CSS 파일을 불러옵니다.

interface ProgressBarProps {
  // 부모 컴포넌트(SignupWizard)로부터 목표 퍼센트 값을 받습니다.
  targetPercent: number;
}

const SmoothProgressBar: React.FC<ProgressBarProps> = ({ targetPercent } : ProgressBarProps) => {
  return (
    // 게이지의 배경(회색 트랙)이 되는 컨테이너입니다.
    <div className={`progress-container`}>
      {/* 실제 채워지는 파란색 막대입니다. width가 동적으로 변경됩니다. */}
      <div
        className={`progress-bar`}
        style={{ width: `${targetPercent}%` }}
      />
    </div>
  );
};

export default SmoothProgressBar;
