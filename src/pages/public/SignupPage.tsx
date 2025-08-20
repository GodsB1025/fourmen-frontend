import React, { useMemo, useState } from "react";
import { signup , sendVerificationEmail, verifyEmailCode} from "../../apis/Auth";
import type { SignupRequest } from "../../apis/Types";
import "./SignupPage.css";
import SignUpTypePick from "../../components/auth/SignUpTypePick";
import SignUpEmail from "../../components/auth/SignUpEmail";
import SignUpAuthCode from "../../components/auth/SignUpAuthCode";
import type { Step, Form, UserType } from "../../types/auth";
import SignUpInfo from "../../components/auth/SignUpInfo";
import SignUpAdminCode from "../../components/auth/SignUpAdminCode";

export default function SignupWizard() {
  const [step, setStep] = useState<Step>(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState<Form>({
    type: null,
    email: "",
    code: "",
    name: "",
    pw: "",
    pw2: "",
    adminKey: "",
    phone: "",
  });

  const flow = useMemo<Step[]>(() => (f.type === "ADMIN" ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 5]), [f.type]);
  const visibleIndex = flow.indexOf(step);
  const percent = Math.round(((visibleIndex + 1) / flow.length) * 100);

  const goNext = () => setStep((s) => (Math.min(s + 1, 5) as Step));
  const goPrev = () => setStep((s) => (Math.max(s - 1, 0) as Step));

  // const MOCK_EMAIL = import.meta.env.VITE_MOCK_EMAIL_VERIFICATION === 'true';

  async function handleSendEmail() {
    setErr(null);
    if (!/^\S+@\S+\.\S+$/.test(f.email)) {
      setErr("이메일 형식이 올바르지 않습니다.");
      return;
    }
    setBusy(true);
    try {
      console.log("인증 이메일 전송 실행")
      await sendVerificationEmail(f.email);
      goNext();
    } catch (e: any) {
      setErr(e?.message || "인증 메일 전송에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyCode() {
    // 정확히 6자리 숫자 사전 검증
    if (!/^\d{6}$/.test(f.code)) {
      setErr("인증코드는 6자리 숫자입니다.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      await verifyEmailCode(f.email, f.code);
      goNext();
    } catch (e: any) {
      setErr(e?.message || "인증코드가 올바르지 않습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="su-wrap">
      <main className="su-card">
        <h1 className="su-title">회원가입</h1>

        {/* 진행률 step이 0이상일 때만 나옴 */}
        {step > 0 && step < 5 && (
          <div className="su-progress">
            <div className="bar"><div className="fill" style={{ width: `${percent}%` }} /></div>
            <div className="meta">
              <span>{labelFor(step, f.type)}</span>
              <span>{percent}%</span>
            </div>
          </div>
        )}

        {/* Step 0: 유형 선택 */}
        {step === 0 && (
          <SignUpTypePick
          f={f}
          setF={setF}
          setErr={setErr}
          goNext={goNext}
          />
        )}

        {/* Step 1: 이메일 */}
        {step === 1 && (
          <SignUpEmail
          f={f}
          setF={setF}
          busy={busy}
          goPrev={goPrev}
          handleClick={handleSendEmail}
          />
        )}

        {/* Step 2: 인증코드 */}
        {step === 2 && (
          <SignUpAuthCode
          f={f}
          setF={setF}
          busy={busy}
          goPrev={goPrev}
          handleClick={handleVerifyCode}
          />
        )}

        {/* Step 3: 기본정보 */}
        {step === 3 && (
          <SignUpInfo 
          f={f}
          setF={setF}
          setErr={setErr}
          setStep={setStep}
          goPrev={goPrev}
          goNext={goNext}
          />
        )}

        {/* Step 4: 관리자 코드 */}
        {step === 4 && (
          <SignUpAdminCode 
          f={f}
          busy={busy}
          setF={setF}
          setBusy={setBusy}
          setErr={setErr}
          setStep={setStep}
          goPrev={goPrev}
          />
        )}

        {/* Step 5: 완료 (+ 실제 가입 요청) */}
        {step === 5 && (
          <section className="su-done">
            <h2>회원가입 완료</h2>
            <p>환영합니다!</p>

            <button
              className="primary"
              disabled={busy}
              onClick={async () => {
                setErr(null);
                setBusy(true);
                try {
                  const payload: SignupRequest = {
                    email: f.email.trim(),
                    password: f.pw,
                    name: f.name.trim(),
                    phone: f.phone.trim(),
                    adminCode: f.type === "ADMIN" ? f.adminKey.trim() : "",
                  };
                  console.log(payload);
                
                  await signup(payload);
                  alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
                  window.location.href = "/signin"; // 또는 useNavigate
                } catch (e: any) {
                  setErr(e?.message || "회원가입 중 오류가 발생했습니다.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "처리중..." : "지금 가입 완료하기"}
            </button>

            <button className="ghost" onClick={() => (window.location.href = "/")}>
              메인으로
            </button>
          </section>
        )}

        {err && <p className="su-error">{err}</p>}
      </main>
    </div>
  );
}

function labelFor(step: Step, type: UserType) {
  switch (step) {
    case 1: return "이메일 입력";
    case 2: return "인증코드 확인";
    case 3: return "정보 입력";
    case 4: return type === "ADMIN" ? "관리자 코드" : "건너뜀";
  }
}
