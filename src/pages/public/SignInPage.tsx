import React, { useState } from 'react';
import './SignInPage.css';
import Login from '../../components/auth/Login';
import { login } from '../../api/Auth';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../stores/paths';
import { useAuthStore } from '../../stores/auths';

const SignInPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const nav = useNavigate();
    const { setUser } = useAuthStore();


    // 폼 제출 시 기본 동작 방지
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const user = await login({ email: email.trim(), password });
      // 세션 유지용: 간단히 localStorage에 저장 (원하면 Context/Zustand로 대체)
      // localStorage.setItem('currentUser', JSON.stringify(user));
      setUser(user);
      nav(PATH.COMMANDER, { replace: true });
    } catch (e: any) {
      setErr(e?.message || '로그인에 실패했습니다.');
    } finally {
      setBusy(false);
    }
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
            {err && <div style={{ color:'#b91c1c', marginTop:12 }}>{err}</div>}
        </div>
    );
};

export default SignInPage;