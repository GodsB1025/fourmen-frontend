import React from 'react'
import TextInput from '../common/TextInput';
import type { Form } from '../../types/auth';

interface  SignUpEmailProps {
    f: Form,
    setF: React.Dispatch<React.SetStateAction<Form>>,
    busy: boolean,
    goPrev: () => void,
    handleClick: () => void
}

const SignUpEmail = ({
    f,
    setF,
    busy,
    goPrev,
    handleClick,
}: SignUpEmailProps) => {
  return (
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
            <button className="primary" disabled={busy} onClick={handleClick}>
                {busy ? "발송중..." : "인증 메일 보내기"}
            </button>
        </div>
    </section>
  )
}

export default SignUpEmail