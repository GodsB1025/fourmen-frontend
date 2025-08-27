import React, { useState } from "react";
import "./SignInPage.css";
import Login from "../../components/auth/Login";
import { login } from "../../apis/Auth";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../types/paths";
import type { User } from "../../apis/Types";
import { useAuthStore } from "../../stores/authStore";
import AssetPreloader from "../../components/common/AssetPreloader"; // ✨ Preloader import

const SignInPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [_busy, setBusy] = useState(false);
    const loginUser = useAuthStore((state) => state.login);
    const nav = useNavigate();

    // 폼 제출 시 기본 동작 방지
    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErr(null);
        setBusy(true);
        try {
            var data = await login({ email: email.trim(), password });
            const user: User = {
                userId: data.userId,
                name: data.name,
                email: data.email,
                role: data.role,
                company: data.company,
            };
            loginUser(user);
            nav(PATH.COMMANDER, { replace: true });
        } catch (e: any) {
            setErr(e?.message || "로그인에 실패했습니다.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div
        className="signin-page"
        >
            <AssetPreloader /> {/* ✨ 여기에 Preloader 컴포넌트를 추가합니다 */}
            <Login email={email} password={password} setEmail={setEmail} setPassword={setPassword} handleSubmit={handleLogin} />
            {err && <div style={{ color: "#b91c1c", marginTop: 12 }}>{err}</div>}
        </div>
    );
};

export default SignInPage;
