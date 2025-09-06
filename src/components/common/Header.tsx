import { useState, useEffect } from "react"; // useState와 useEffect를 import 합니다.
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { PATH } from "../../types/paths";
import { useAuthStore } from "../../stores/authStore";
import type { User } from "../../apis/Types";
import { IconLogo } from "../../assets/icons";
import ThemeTransitionOverlay from "./ThemeTransitionOverlay";

// 아이콘 컴포넌트를 추가합니다.
const IconSun = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const IconMoon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);


const Header = () => {

  const navigate = useNavigate()
  const user : User | null = useAuthStore((state)=>state.user)
  const isAuthenticated : boolean = useAuthStore((state)=>state.isAuthenticated)

  // 1. 'light' 또는 'dark' 값을 가질 테마 상태를 추가합니다.
  // localStorage에서 이전에 저장된 테마를 가져오거나, 없으면 'light'를 기본값으로 사용합니다.
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);

  // 2. 테마가 변경될 때마다 <html> 태그의 클래스를 변경하고, 선택을 localStorage에 저장합니다.
  useEffect(() => {
    const root = document.documentElement; // <html> 태그
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      if (isThemeTransitioning) return; // 전환 중에는 재실행 방지

      setIsThemeTransitioning(true);

      setTimeout(() => {
          setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
      }, 1000);
  };

  const handleAnimationEnd = () => {
      setIsThemeTransitioning(false);
  };

  return (
    <header className="header" role="banner">
      <div className="inner">
        <Link to={PATH.ROOT} className="brand" aria-label="4MEN Home">
          <IconLogo/>
        </Link>
        <nav className="header-nav" aria-label="Primary"> {/* 4. nav에 클래스 추가 */}
          {/* 5. 테마 토글 버튼 추가 */}
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="테마 전환">
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
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
      <ThemeTransitionOverlay
          isTransitioning={isThemeTransitioning}
          onAnimationEnd={handleAnimationEnd}
          isDark={theme !== 'light'}
      />
    </header>
  );
}

export default Header;