import React, { useMemo, useState } from "react";
import TextInput from "../../components/common/TextInput"; // 경로 맞게 수정
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
          <SignUpTypePick 
          f={f}
          setF={setF}
          setErr={setErr}
          goNext={goNext}
          />
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
