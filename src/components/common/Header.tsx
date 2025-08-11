import React from "react";
import "./Header.css";

type HeaderProps = {
  /** onLogin이 있으면 버튼으로, 없으면 /login 링크로 렌더링 */
  onLogin?: () => void;
  brandHref?: string;
};

const Header: React.FC<HeaderProps> = ({ onLogin, brandHref = "/" }) => {
  return (
    <header className="header" role="banner">
      <div className="inner">
        <a href={brandHref} className="brand" aria-label="4MEN Home">
          4MEN
        </a>

        <nav aria-label="Primary" className="nav">
          {onLogin ? (
            <button type="button" className="loginBtn" onClick={onLogin}>
              Log In
            </button>
          ) : (
            <a href="/login" className="loginLink">
              Log In
            </a>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;