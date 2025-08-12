import React from 'react'
import './Login.css'
import { PATH } from '../../stores/paths';
import { Link } from 'react-router-dom';
import TextInput from '../common/TextInput';
import ActionButton from '../common/ActionButton';

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

    const isFormValid = email.trim() !== '' && password.trim() !== '';
    return (
        <main className="signin-main">
            <div className="signin-container">
                <h1 className="signin-title">로그인</h1>
                <div className="spacer" style={{ flexGrow: 2 }} />
                <form onSubmit={handleLogin} className="signin-form">
                    <TextInput
                    type="email"
                    placeholder='test@email.com'
                    value={email}
                    name="email"
                    onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextInput
                    type="password"
                    placeholder='password'
                    value={password}
                    name="password"
                    onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="spacer" style={{ flexGrow: 1 }} />
                    <ActionButton type="submit" isActive={isFormValid}>
                        로그인
                    </ActionButton>
                </form>
                <div className="spacer" style={{ flexGrow: 2 }} />
                <div className="signup-prompt">
                    <span>계정이 없으신가요?</span>
                    <Link to={PATH.SIGN_UP} className="signup-link">
                    회원가입 하기
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default Login