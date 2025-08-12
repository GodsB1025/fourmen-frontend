import React from 'react'
import { PATH } from '../../stores/paths';
import { Link } from 'react-router-dom';

interface SignInProps {
    email : string;
    password : string;
    setEmail : React.Dispatch<React.SetStateAction<string>>;
    setPassword : React.Dispatch<React.SetStateAction<string>>;
    handleLogin : (event: React.FormEvent<HTMLFormElement>) => void;
}

const Login = ({
    email, password,
    setEmail, setPassword,
    handleLogin
    }: SignInProps) => {
    return (
        <div>
            <main className="signin-main">
                <div className="signin-container">
                <h1 className="signin-title">로그인</h1>
                <form onSubmit={handleLogin} className="signin-form">
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="signin-input"
                    aria-label="Email"
                    autoComplete="email"
                    />
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="signin-input"
                    aria-label="Password"
                    autoComplete="current-password"
                    />
                    <button type="submit" className="signin-button">
                    Login
                    </button>
                </form>
                <div className="signup-prompt">
                    <span>계정이 없으신가요?</span>
                    <Link to={PATH.SIGN_UP} className="signup-link">
                    회원가입 하기
                    </Link>
                </div>
                </div>
            </main>
        </div>
    )
}

export default Login