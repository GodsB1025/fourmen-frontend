import React, { useEffect, useState } from "react";
import { signup, sendVerificationEmail, verifyEmailCode } from "../../apis/Auth";
import type { SignupRequest } from "../../apis/Types";
import "./SignupPage.css";
import SignUpTypePick from "../../components/auth/SignUpTypePick";
import SignUpEmail from "../../components/auth/SignUpEmail";
import SignUpAuthCode from "../../components/auth/SignUpAuthCode";
import type { Step, Form, UserType } from "../../types/auth";
import SignUpInfo from "../../components/auth/SignUpInfo";
import SignUpAdminCode from "../../components/auth/SignUpAdminCode";
import SmoothProgressBar from "../../components/auth/SmoothProgressBar";
import Toast from "../../components/common/Toast";
import { replace, useNavigate } from "react-router-dom";
import { PATH } from "../../types/paths";
import { IconCheck } from "../../assets/icons";

export default function SignupWizard() {
  const navigate = useNavigate()

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

  const [percent, setPercent] = useState<number>(0);

  const goNext = () => {
    setStep((s) => (Math.min(s + 1, 5) as Step))
  };
  const goPrev = () => {
    setStep((s) => (Math.max(s - 1, 0) as Step))
  };

  useEffect(() => {
    // step이 0일 때는 0%로 설정
    if (step === 0) {
      setPercent(0);
      return;
    }

    // f.type에 따라 적절한 퍼센티지를 계산
    const newPercent = f.type === "ADMIN"
      ? 25 * step
      : 34 * step;
      
    // 퍼센티지가 100을 넘지 않도록 조정
    setPercent(Math.min(newPercent, 100));

  }, [step, f.type]);

  async function handleSendEmail() {
    
    setErr(null);
    goNext();
    return;
    
    /*
    setErr(null);
    if (!/^\S+@\S+\.\S+$/.test(f.email)) {
      setErr("이메일 형식이 올바르지 않습니다.");
      return;
    }
    setBusy(true);
    try {
      await sendVerificationEmail(f.email);
      goNext();
    } catch (e: any) {
      setErr(e?.message || "인증 메일 전송에 실패했습니다.");
    } finally {
      setBusy(false);
    }
      */
  }

  async function handleVerifyCode() {
    if (!/^\d{6}$/.test(f.code)) {
      setErr("인증코드는 6자리 숫자입니다.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      // await verifyEmailCode(f.email, f.code);
      goNext();
    } catch (e: unknown) {
      let errorMessage = "인증코드가 올바르지 않습니다."
      if(e instanceof Error) errorMessage = e.message
      setErr(errorMessage);
    } finally {
      setBusy(false);
    }
  }

  const handleSignUp = async () => {
    setErr(null);
    setBusy(true);
    console.log("회원가입 로직 실행")
    setBusy(false)
    setStep(5);
    // try {
    //   const payload: SignupRequest = {
    //     email: f.email.trim(),
    //     password: f.pw,
    //     name: f.name.trim(),
    //     phone: f.phone.trim(),
    //     adminCode: f.type === "ADMIN" ? f.adminKey.trim() : "",
    //   };
    //   await signup(payload);
    //   setStep(5);
    // } catch (e: unknown) {
    //   let errorMessage = "회원가입 중 오류가 발생했습니다."
    //   if(e instanceof Error) errorMessage = e.message
    //   setErr(errorMessage);
    // } finally {
    //   setBusy(false);
    // }
  }

  return (
    <div className="su-wrap">
      <main className="su-card">
        { step===5 && <IconCheck fillColor="#4B52FF" strokeColor="#fff"/> }
        <h1 className="su-title">{step !== 5 ? "회원가입" : "환영합니다!"}</h1>

        {/* 진행률 (0 < step < 5) */}
        {step > 0 && step < 5 && (
          <div className="su-progress">
            <SmoothProgressBar targetPercent={percent} />
            <div className="meta">
              <span>{sequence[step-1].label}</span>
              <p>{sequence[step-1].hint}</p>
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
            goPrev={goPrev}
            goNext={goNext}
            goSignUp={handleSignUp}
          />
        )}

        {/* Step 4: 관리자 코드 */}
        {step === 4 && (
          <SignUpAdminCode
            f={f}
            busy={busy}
            setF={setF}
            goPrev={goPrev}
            goSignUp={handleSignUp}
          />
        )}

        {/* Step 5: 완료 */}
        {step === 5 && (
          <section className="su-done">
            <p><span>{f.name}</span>님 반갑습니다.<br/>({f.email})로 회원가입이 완료 되었습니다.<br/>로그인을 해서 서비스를 이용하실 수 있습니다.</p>

            <button
              className="primary su-btn"
              style={{ width: "50%", margin: "0px auto" }}
              onClick={() => navigate(PATH.SIGN_IN, { replace : true })}
            >
              로그인 화면으로
            </button>
          </section>
        )}

        {err && 
          <Toast 
              message={err}
              onClose={() => setErr(null)}
              type="error"
          />
        }
      </main>
    </div>
  );
}

const sequence = [
  {
    label: "이메일을 입력해주세요",
    hint: "인증을 위해 이메일을 입력해주세요. 입력한 이메일로 인증번호가 발송됩니다."
  },
  {
    label: "인증번호를 입력해주세요",
    hint: "입력하신 이메일로 인증번호가 발송됐습니다. 주어진 시간 안에 올바른 인증번호를 입력하세요."
  },
  {
    label: "상세 정보를 입력해주세요",
    hint: "회원가입을 위해 정보를 입력해주세요. 수집된 정보는 가입 이외에 어디에도 사용되지 않습니다."
  },
  {
    label: "관리자 코드를 입력해주세요",
    hint: "관리자 권한을 얻기 위해서는 자사에서 지급한 코드가 있어야 합니다. 코드 지급 관련은 따로 문의 해주세요"
  }
]
