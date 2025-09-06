import React from 'react';
import './ThemePreloader.css';

interface ThemePreloaderProps {
  isDark: boolean; // 다음 테마가 다크 모드인지 여부를 받습니다.
}

const ThemePreloader: React.FC<ThemePreloaderProps> = ({ isDark }) => {
  return (
    <div className="preloader-container" aria-label="테마 변경 중...">
      <div className={`sun-moon ${isDark ? 'to-moon' : 'to-sun'}`}>
        <div className="sun"></div>
        <div className="moon"></div>
      </div>
    </div>
  );
};

export default ThemePreloader;