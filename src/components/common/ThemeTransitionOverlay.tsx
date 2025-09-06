import React from 'react';
import './ThemeTransitionOverlay.css';
import ThemePreloader from './ThemePreloader';

interface ThemeTransitionOverlayProps {
    isTransitioning: boolean;
    onAnimationEnd: () => void;
    isDark: boolean;
}

const ThemeTransitionOverlay: React.FC<ThemeTransitionOverlayProps> = ({ isTransitioning, onAnimationEnd, isDark }) => {
    if (!isTransitioning) return null;

    return (
        <div 
            className="theme-transition-overlay"
            onAnimationEnd={onAnimationEnd}
        >
            <ThemePreloader isDark={isDark} />
        </div>
    );
};

export default ThemeTransitionOverlay;