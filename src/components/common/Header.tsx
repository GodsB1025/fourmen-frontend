import "./Header.css";
import { Link } from "react-router-dom";
import { PATH } from "../../types/paths";
import { useAuthStore } from "../../stores/authStore";
import type { User } from "../../apis/Types";

const Header = () => {

  const user : User | null = useAuthStore((state)=>state.user)
  const isAuthenticated : boolean = useAuthStore((state)=>state.isAuthenticated)

  return (
    <header className="header" role="banner">
      <div className="inner">
        <Link to={PATH.ROOT} className="brand" aria-label="4MEN Home">
          4MEN
        </Link>
        <nav aria-label="Primary">
          {isAuthenticated && user? (
            <Link to={PATH.COMMANDER} className="loginLink">
              {user.name}님 안녕하세요.
            </Link>
          ) : (
            <Link to={PATH.SIGN_IN} className="loginLink">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header