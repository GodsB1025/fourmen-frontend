import React, { useMemo, useState } from "react";
import TextInput from "../../components/common/TextInput"; // 경로 맞게 수정
import { signup , sendVerificationEmail, verifyEmailCode} from "../../api/Auth";
import type { SignupRequest } from "../../api/Types";
import "./SignupPage.css";
import SignUpTypePick from "../../components/auth/SignUpTypePick";

type Type = "USER" | "ADMIN" | null;
type Step = 0 | 1 | 2 | 3 | 4 | 5;

type Form = {
  type: Type;
  email: string;
  code: string;
  name: string;
  pw: string;
  pw2: string;
  adminKey: string;
  phone: string;
};

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
    // 간단한 형식 체크
    if (!/^\S+@\S+\.\S+$/.test(f.email)) {
      setErr("이메일 형식이 올바르지 않습니다.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
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

        {/* 진행률 */}
        {step > 0 && (
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
          <section className="su-step su-typepick">
            <div className="su-typegrid">
              {/* 일반 회원 */}
              <button
                type="button"
                className={`su-typecard ${f.type === "USER" ? "active" : ""}`}
                onClick={() => setF((p) => ({ ...p, type: "USER" }))}
              >
                <div className="su-typecard-icon" aria-hidden>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z" />
                    <path d="M20 7h-1V6a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0V9h1a1 1 0 100-2z" />
                  </svg>
                </div>
                <strong className="su-typecard-title">일반 회원가입</strong>
                <p className="su-typecard-desc">개인 사용자용입니다. 기본 기능을 바로 시작하세요.</p>
              </button>

              {/* 관리자 회원 */}
              <button
                type="button"
                className={`su-typecard ${f.type === "ADMIN" ? "active" : ""}`}
                onClick={() => setF((p) => ({ ...p, type: "ADMIN" }))}
              >
                <div className="su-typecard-icon" aria-hidden>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                    <path d="M4 20v-1c0-3.314 3.582-6 8-6s8 2.686 8 6v1H4z" />
                    <circle cx="17.5" cy="7.5" r="2.5" />
                  </svg>
                </div>
                <strong className="su-typecard-title">관리자 회원가입</strong>
                <p className="su-typecard-desc">조직/관리자용입니다. 팀과 권한을 관리하세요.</p>
              </button>
            </div>

            <div className="su-actions">
              <button
                className="primary"
                onClick={() => {
                  if (!f.type) return setErr("가입 유형을 선택하세요.");
                  setErr(null);
                  goNext();
                }}
              >
                다음
              </button>
            </div>
          </section>
        )}

        {/* Step 1: 이메일 */}
        {step === 1 && (
          <section className="su-step">
            <p className="su-hint">인증을 위해 이메일을 입력하세요.</p>
            <TextInput
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              placeholder="test@email.com"
              type="email"
              autoComplete="email"
            />
            <div className="su-actions">
              <button onClick={goPrev}>이전</button>
              <button className="primary" disabled={busy} onClick={handleSendEmail}>
                {busy ? "발송중..." : "인증 메일 보내기"}
              </button>
            </div>
          </section>
        )}

        {/* Step 2: 인증코드 */}
        {step === 2 && (
          <section className="su-step">
            <p className="su-hint">메일로 받은 인증코드를 입력하세요. (예: 123456)</p>
            <TextInput
              value={f.code}
              onChange={(e) => setF({ ...f, code: e.target.value.replace(/\D/g, "") })}
              placeholder="인증코드"
              inputMode="numeric"
              maxLength={6}
            />
            <div className="su-actions">
              <button onClick={goPrev}>이전</button>
              <button className="primary" disabled={busy} onClick={handleVerifyCode}>
                {busy ? "확인중..." : "다음"}
              </button>
            </div>
          </section>
        )}

        {/* Step 3: 기본정보 */}
        {step === 3 && (
          <section className="su-step">
            <div className="su-field">
              <label>이름</label>
              <TextInput
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                placeholder="홍길동"
                autoComplete="name"
              />
            </div>
            <div className="su-field">
              <label>연락처</label>
              <TextInput
                value={f.phone}
                onChange={(e) => setF({ ...f, phone: e.target.value })}
                placeholder="010-1234-5678"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            <div className="su-field">
              <label>비밀번호</label>
              <TextInput
                value={f.pw}
                onChange={(e) => setF({ ...f, pw: e.target.value })}
                placeholder="8자 이상"
                type="password"
                autoComplete="new-password"
              />
            </div>
            <div className="su-field">
              <label>비밀번호 확인</label>
              <TextInput
                value={f.pw2}
                onChange={(e) => setF({ ...f, pw2: e.target.value })}
                placeholder="비밀번호 확인"
                type="password"
                autoComplete="new-password"
              />
            </div>
            <div className="su-actions">
              <button onClick={goPrev}>이전</button>
              <button
                className="primary"
                onClick={() => {
                  if (!f.name.trim()) return setErr("이름을 입력하세요.");
                  if (!f.phone.trim()) return setErr("연락처를 입력하세요.");
                  if (f.pw.length < 8) return setErr("비밀번호는 8자 이상이어야 합니다.");
                  if (f.pw !== f.pw2) return setErr("비밀번호가 일치하지 않습니다.");
                  setErr(null);
                  if (f.type === "ADMIN") goNext();
                  else setStep(5);
                }}
              >
                다음
              </button>
            </div>
          </section>
        )}

        {/* Step 4: 관리자 코드 */}
        {step === 4 && (
          <section className="su-step">
            <div className="su-adminbox">
              <div className="stripe" />
              <strong>관리자 확인 코드</strong>
              <p className="desc">조직에서 발급받은 코드를 입력하세요.</p>
            </div>
            <TextInput
              value={f.adminKey}
              onChange={(e) => setF({ ...f, adminKey: e.target.value })}
              placeholder="A3ZE48SZ"
            />
            <div className="su-actions">
              <button onClick={goPrev}>이전</button>
              <button
                className="primary"
                disabled={busy}
                onClick={async () => {
                  setErr(null); setBusy(true);
                  try {
                    // 필요하면 실제 관리자 코드 검증 API 연동
                    if (!f.adminKey.trim()) throw new Error("관리자 코드를 입력하세요.");
                    setStep(5);
                  } catch (e: any) {
                    setErr(e?.message || "관리자 코드가 올바르지 않습니다.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "확인중..." : "다음"}
              </button>
            </div>
          </section>
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

function labelFor(step: Step, type: Type) {
  switch (step) {
    case 0: return "가입유형 선택";
    case 1: return "이메일 입력";
    case 2: return "인증코드 확인";
    case 3: return "정보 입력";
    case 4: return type === "ADMIN" ? "관리자 코드" : "건너뜀";
    case 5: return "완료";
  }
}
