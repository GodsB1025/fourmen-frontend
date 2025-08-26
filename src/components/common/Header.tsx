import React from "react";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { PATH } from "../../types/paths";
import { useAuthStore } from "../../stores/authStore";
import type { User } from "../../apis/Types";
import { IconLogo } from "../../assets/icons";

const Header = () => {

  const navigate = useNavigate()
  const user : User | null = useAuthStore((state)=>state.user)
  const isAuthenticated : boolean = useAuthStore((state)=>state.isAuthenticated)

  return (
    <header className="header" role="banner">
      <div className="inner">
        <Link to={PATH.ROOT} className="brand" aria-label="4MEN Home">
          <IconLogo/>
        </Link>
        <nav aria-label="Primary">
          {isAuthenticated && user? (
            <Link to={PATH.COMMANDER} className="loginLink">
              {user.name}님 안녕하세요.
            </Link>
          ) : (
            <button 
              className="loginLink"
              onClick={() => navigate(PATH.SIGN_IN)}
            >
              LOGIN
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header