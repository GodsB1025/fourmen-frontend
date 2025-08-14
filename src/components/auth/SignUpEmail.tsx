import React from 'react'
import TextInput from '../common/TextInput';

type Type = "USER" | "ADMIN" | null;
type Form = {
    type: Type;
    email: string;
    code: string;
    name: string;
    pw: string;
    pw2: string;
    adminKey: string;
}

interface  SignUpEmailProps {
    f: Form,
    setF: React.Dispatch<React.SetStateAction<Form>>,
    busy: boolean,
    setBusy: React.Dispatch<React.SetStateAction<boolean>>,
    setErr: React.Dispatch<React.SetStateAction<string | null>>,
    goPrev: () => void,
    goNext: () => void,
}

const SignUpEmail = ({
    f,
    setF,
    busy,
    setBusy,
    setErr,
    goPrev,
    goNext,
}: SignUpEmailProps) => {
  return (
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
            }}>
            {busy ? "발송중..." : "인증 메일 보내기"}
            </button>
        </div>
    </section>
  )
}

export default SignUpEmail