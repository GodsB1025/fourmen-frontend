import React from 'react';
import './ContractCard.css'; // 실제 카드 스타일을 가져옵니다.
import './SkeletonCard.css'; // 스켈레톤 전용 스타일을 분리합니다.

const SkeletonCard = () => {
    return (
        <div className="card-item skeleton">
            <div className="card-item__figure">
                {/* 이미지 스켈레톤 */}
                <div className="skeleton-image shimmer" />
            </div>
            <div className="card-item__body shimmer">
                {/* 텍스트 스켈레톤 */}
                <div className="skeleton-text" />
            </div>
        </div>
    );
};

export default SkeletonCard;