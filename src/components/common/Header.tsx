import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import { PATH } from "../../types/paths";

type HeaderProps = {
  onLogin?: () => void;
  brandHref?: string;
};

export default function Header({ onLogin, brandHref = "/" }: HeaderProps) {
  return (
    <header className="header" role="banner">
      <div className="inner">
        <Link to={brandHref} className="brand" aria-label="4MEN Home">
          4MEN
        </Link>
        <nav aria-label="Primary" className="nav">
          {onLogin ? (
            <button type="button" className="loginBtn" onClick={onLogin}>
              Log In
            </button>
          ) : (
            <Link to={PATH.SIGN_IN} className="loginLink">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
