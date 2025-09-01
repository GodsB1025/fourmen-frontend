import { type JSX, useEffect } from 'react';
import Footer from '../../components/common/Footer';
import mans from '../../assets/imgs/mens.png'
import { useNavigate } from "react-router-dom";
import './LobbyPage.css';
import { useAuthStore } from '../../stores/authStore';
import { PATH } from '../../types/paths';

function LobbyPage(): JSX.Element | null {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // 인증 상태이면 PrivateLobbyPage (PATH.COMMANDER)로 리디렉션합니다.
    if (isAuthenticated) {
      navigate(PATH.COMMANDER, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleClick = () => {
    navigate("/signin");
  };

  function MicIcon() {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="8" y="3" width="8" height="12" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 11a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 18v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  function SummaryIcon() {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 8h8M8 12h5M8 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16.5" cy="8" r="0.75" fill="currentColor" />
      </svg>
    );
  }
  function ContractIcon() {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 3h8l3 3v15H7V3z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M15 3v3h3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 12h6M9 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 9h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  function CalendarIcon() {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 3v4M16 3v4M3 9h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="7" y="12" width="4" height="4" rx="1" fill="currentColor" />
      </svg>
    );
  }

  // 리디렉션이 실행되는 동안 페이지 내용이 잠시 보이는 것을 방지합니다.
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="lobby">
      <main>
        {/* Hero */}
        <section className="hero container">
          <div className="hero-text">
            <h1>
              회의부터 계약까지, <br /> 단 하나의 플랫폼으로
            </h1>
            <p className="sub">
              AI가 회의를 자동으로 기록하고 요약해요. <br />
              미팅 이후 액션·계약까지 한 곳에서 이어집니다.
            </p>
            <button className="btn-primary" onClick={handleClick}>시작하기</button>
          </div>

          <div className="hero-visual checkerboard large" aria-hidden="true">
            <img src={mans} alt="웃는 남자"/>
          </div>
        </section>

        {/* Pain points */}
        <section className="pain container">
          <h2 className="lobby-section-title">혹시 이런 불편함, 겪고 계신가요?</h2>
          <ul className="pain-list">
            <li>
              <h3>분산된 협업</h3>
              <p>회의록·파일·액션이 여러 도구에 흩어져 추적이 힘들어요.</p>
            </li>
            <li>
              <h3>회의록 정리 스트레스</h3>
              <p>끝나고 요약·공유까지 시간이 너무 오래 걸려요.</p>
            </li>
            <li>
              <h3>후속 진행 지연</h3>
              <p>담당 지정/리마인드가 없어 일이 쉽게 멈춰요.</p>
            </li>
          </ul>
        </section>

        {/* Services */}
        <section className="services container">
          <h2 className="lobby-section-title">서비스 소개</h2>
          <ul className="service-list">
            <li>
              <div aria-hidden="true">
                <MicIcon/>
              </div>
              <span>AI 회의 기록</span>
            </li>
            <li>
              <div aria-hidden="true">
                <SummaryIcon/>
              </div>
              <span>자동 요약/공유</span>
            </li>
            <li>
              <div aria-hidden="true">
                <CalendarIcon />
              </div>
              <span>타임라인 관리</span>
            </li>
            <li>
              <div aria-hidden="true">
                <ContractIcon />
              </div>
              <span>계약/작업 연계</span>
            </li>
          </ul>
        </section>

        {/* Highlight card */}
        <section className="highlight container">
          <div className="highlight-card">
            <div className="checkerboard md" aria-hidden="true"/>
            <div className="highlight-text">
              <h3>단순한 회의 툴이 아닙니다.</h3>
              <p>
                미팅 이후의 모든 흐름—액션 지정, 진행 상황 추적, 문서/계약—까지
                한 번에 이어집니다. 팀의 시간을 아껴 보세요.
              </p>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="cta">
          <div className="container cta-inner">
            <p>지금 바로 비즈니스 미팅의 혁신을 경험하세요</p>
            <button className="btn-primary btn-small" onClick={handleClick}>시작하기</button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LobbyPage;