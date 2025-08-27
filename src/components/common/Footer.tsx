import React from "react";
import icon from "../../assets/favicon.svg"
import "./Footer.css";

type TeamMember = { name: string; email: string };

type FooterProps = {
  address?: string;
  phone?: string;
  email?: string;
  team?: TeamMember[];
  className?: string;
  children?: React.ReactNode; // 필요하면 명시적으로
};

export default function Footer({
  address = "광주광역시 동구 중앙로 196",
  phone = "+82-010-0000-0000",
  email = "example@gmail.com",
  team = [
    { name: "김경보", email: "godsb1025@gmail.com" },
    { name: "제갈태웅", email: "wgkrtk005@gmail.com" },
    { name: "최호철", email: "ghcjf199818@gmail.com" },
    { name: "홍성재", email: "aurcqhg@gmail.com" },
  ],
  className = "",
}: FooterProps) {
  return (
    <footer className={`site-footer ${className}`} role="contentinfo">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <img src={icon} alt="로고" style={{ width: "40px" }} />
        </div>

        <div className="site-footer__cols">
          <section className="site-footer__left" aria-labelledby="org-info">
            <h2 id="org-info" className="visually-hidden">회사 정보</h2>
            <dl className="site-footer__meta">
              <dt>주소</dt>
              <dd>{address}</dd>
              <dt>연락처</dt>
              <dd>
                <span>{phone}</span>
                <br />
                <span>{email}</span>
              </dd>
            </dl>
          </section>

          <section className="site-footer__right" aria-labelledby="team-heading">
            <h2 id="team-heading" className="site-footer__team-heading">팀 4MEN</h2>
            <ul className="site-footer__team-list">
              {team.map((m, i) => (
                <li key={i}>
                  <span className="site-footer__member-name">{m.name}</span>
                  <span className="site-footer__pipe" aria-hidden="true">|</span>
                  <span className="site-footer__member-email">{m.email}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </footer>
  );
}