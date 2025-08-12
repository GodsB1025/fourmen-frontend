import React, { type JSX } from 'react';
import Footer from '../../components/common/Footer';
import mans from '../../assets/imgs/man.png'
import { useNavigate } from "react-router-dom";
import './LobbyPage.css';

function LobbyPage(): JSX.Element {
  const navigate = useNavigate();
  const handleClick = () => {
    alert("로그인 후 이용가능합니다.");
    navigate("/signin");
  };
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
          <h2 className="section-title">혹시 이런 불편함, 겪고 계신가요?</h2>
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
          <h2 className="section-title">서비스 소개</h2>
          <ul className="service-list">
            <li>
              <div className="checkerboard sm" aria-hidden="true" />
              <span>AI 회의 기록</span>
            </li>
            <li>
              <div className="checkerboard sm" aria-hidden="true" />
              <span>자동 요약/공유</span>
            </li>
            <li>
              <div className="checkerboard sm" aria-hidden="true" />
              <span>타임라인 관리</span>
            </li>
            <li>
              <div className="checkerboard sm" aria-hidden="true" />
              <span>계약/작업 연계</span>
            </li>
          </ul>
        </section>

        {/* Highlight card */}
        <section className="highlight container">
          <div className="highlight-card">
            <div className="checkerboard md" aria-hidden="true" />
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