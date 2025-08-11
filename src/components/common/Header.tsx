import React from "react";
import "./Header.css";

type HeaderProps = {
  onLogin?: () => void;
  brandHref?: string;
};

export default function Header({ onLogin, brandHref = "/" }: HeaderProps) {
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
            <a href="/login" className="loginLink">Log In</a>
          )}
        </nav>
      </div>
    </header>
  );
}
