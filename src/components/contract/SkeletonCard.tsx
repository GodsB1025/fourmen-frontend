import React from 'react';

// 스켈레톤 UI에 적용할 애니메이션 스타일
const skeletonAnimation = `
    @keyframes shimmer {
        100% {
        transform: translateX(100%);
        }
    }
`;

const SkeletonCard = () => {
    return (
        <>
        <style>{skeletonAnimation}</style>
        <div style={{
            border: '1px solid #e0e0e0',
            padding: '10px',
            borderRadius: '8px',
            width: '222px', // 실제 카드 크기와 맞추기 (200px + padding 10*2 + border 1*2)
        }}>
            {/* 이미지 스켈레톤 */}
            <div style={{
            width: '200px',
            height: '112.5px', // 이미지 비율에 맞게 조정 (예: 16:9)
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            marginBottom: '8px',
            position: 'relative',
            overflow: 'hidden',
            }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: 'translateX(-100%)',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                animation: 'shimmer 1.5s infinite',
            }}/>
            </div>
            {/* 텍스트 스켈레톤 */}
            <div style={{
            width: '75%',
            height: '20px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden',
            }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: 'translateX(-100%)',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                animation: 'shimmer 1.5s infinite',
            }}/>
            </div>
        </div>
        </>
    );
};

export default SkeletonCard;