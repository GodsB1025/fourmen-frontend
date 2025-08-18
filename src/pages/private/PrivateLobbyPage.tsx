import React from 'react'
import './PrivateLobbyPage.css'
import { useModalStore } from '../../stores/modalStore'
import { useNavigate } from 'react-router-dom'
import { PATH } from '../../types/paths'

const PrivateLobbyPage = () => {
  const { openModal } = useModalStore()
  const navigate = useNavigate()

  return (
    <div className="lobby-page-container">
      <div className="action-cards">
        <div className="card" onClick={() => openModal('create')}>
          회의 생성
        </div>
        <div className="card" onClick={() => openModal('join')}>
            회의 참여
        </div>
        <div className="card" onClick={() => { navigate(PATH.CONTRACT) }}>
          전자 계약
        </div>
        <div className="card" onClick={() => { navigate(PATH.DASHBOARD) }}>
          대시보드
        </div>
      </div>

      <div className="info-panel">
        <h3>오늘의 할 일</h3>
        <ul>
          <li>오늘은 OO가 예정됐습니다.</li>
        </ul>
        
        <div className="divider"></div>

        <h4>현재 진행중인 미팅</h4>
        <p className="no-meeting-text">현재 진행 중인 화상 미팅이 없습니다.</p>
      </div>
    </div>
  )
}

export default PrivateLobbyPage