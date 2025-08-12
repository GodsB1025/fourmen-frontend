import React, { useMemo, useState } from "react";
import TextInput from "../../components/common/TextInput"; // 경로 맞게 수정
import "./SignupPage.css";

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
  });

  const flow = useMemo<Step[]>(() => (f.type === "ADMIN" ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 5]), [f.type]);
  const visibleIndex = flow.indexOf(step);
  const percent = Math.round(((visibleIndex + 1) / flow.length) * 100);

  const goNext = () => setStep((s) => (Math.min(s + 1, 5) as Step));
  const goPrev = () => setStep((s) => (Math.max(s - 1, 0) as Step));

  const sendEmail = async (email: string) => {
    await sleep(500);
    return { ok: /^\S+@\S+\.\S+$/.test(email) };
  };
  const verifyEmailCode = async (_email: string, code: string) => {
    await sleep(400);
    return { ok: code === "1234" };
  };
  const verifyAdminKey = async (key: string) => {
    await sleep(400);
    return { ok: key.toUpperCase() === "A3ZE48SZ" };
  };
  function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

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
        <p className="su-typecard-desc">
          개인 사용자용입니다. 기본 기능을 바로 시작하세요.
        </p>
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
        <p className="su-typecard-desc">
          조직/관리자용입니다. 팀과 권한을 관리하세요.
        </p>
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
              placeholder="you@example.com"
              type="email"
            />
            <div className="su-actions">
              <button onClick={goPrev}>이전</button>
              <button
                className="primary"
                disabled={busy}
                onClick={async () => {
                  setErr(null); setBusy(true);
                  const r = await sendEmail(f.email);
                  setBusy(false);
                  if (!r.ok) return setErr("이메일 형식이 올바르지 않습니다.");
                  goNext();
                }}
              >
                {busy ? "발송중..." : "인증 메일 보내기"}
              </button>
            </div>
          </section>
        )}

        {/* Step 2: 인증코드 */}
        {step === 2 && (
          <section className="su-step">
            <p className="su-hint">메일로 받은 인증코드를 입력하세요. (예: 1234)</p>
            <TextInput
              value={f.code}
              onChange={(e) => setF({ ...f, code: e.target.value.replace(/\D/g, "") })}
              placeholder="인증코드"
              inputMode="numeric"
              maxLength={6}
            />
            <div className="su-actions">
              <button onClick={goPrev}>이전</button>
              <button
                className="primary"
                disabled={busy}
                onClick={async () => {
                  setErr(null); setBusy(true);
                  const r = await verifyEmailCode(f.email, f.code);
                  setBusy(false);
                  if (!r.ok) return setErr("인증코드가 올바르지 않습니다.");
                  goNext();
                }}
              >
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
              />
            </div>
            <div className="su-field">
              <label>비밀번호</label>
              <TextInput
                value={f.pw}
                onChange={(e) => setF({ ...f, pw: e.target.value })}
                placeholder="8자 이상"
                type="password"
              />
            </div>
            <div className="su-field">
              <label>비밀번호 확인</label>
              <TextInput
                value={f.pw2}
                onChange={(e) => setF({ ...f, pw2: e.target.value })}
                placeholder="비밀번호 확인"
                type="password"
              />
            </div>
            <div className="su-actions">
              <button onClick={goPrev}>이전</button>
              <button
                className="primary"
                onClick={() => {
                  if (!f.name.trim()) return setErr("이름을 입력하세요.");
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
                  const r = await verifyAdminKey(f.adminKey.trim());
                  setBusy(false);
                  if (!r.ok) return setErr("관리자 코드가 올바르지 않습니다.");
                  setStep(5);
                }}
              >
                {busy ? "확인중..." : "다음"}
              </button>
            </div>
          </section>
        )}

        {/* Step 5: 완료 */}
        {step === 5 && (
          <section className="su-done">
            <h2>회원가입 완료</h2>
            <p>환영합니다!</p>
            <button className="ghost" onClick={() => (window.location.href = "/")}>메인으로</button>
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
