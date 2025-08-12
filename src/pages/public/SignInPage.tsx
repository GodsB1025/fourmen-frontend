import React, { useState } from 'react';
import './SignInPage.css';
import Login from '../../components/auth/Login';

const SignInPage = () => {
    const [email, setEmail] = useState('test@test.com');
    const [password, setPassword] = useState('●●●●●●●●●●●●');

    // 폼 제출 시 기본 동작 방지
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // TODO: 실제 로그인 로직 구현 (API 호출 등)
        console.log('로그인 시도:', { email, password });
    };

    return (
        <div className="signin-page">
            <Login
                email={email}
                password={password}
                setEmail={setEmail}
                setPassword={setPassword}
                handleLogin={handleSubmit}
            />
        </div>
    );
};

export default SignInPage;