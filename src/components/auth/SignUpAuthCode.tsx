import React from 'react'
import TextInput from '../common/TextInput';
import type { Form } from '../../types/auth';

interface  SignUpAuthCodeProps {
    f: Form,
    setF: React.Dispatch<React.SetStateAction<Form>>,
    busy: boolean,
    goPrev: () => void,
    handleClick: () => void
}

const SignUpAuthCode = ({
    f,
    setF,
    goPrev,
    busy,
    handleClick
}: SignUpAuthCodeProps) => {
    return (
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
                <button className="primary" disabled={busy} onClick={handleClick}>
                    {busy ? "확인중..." : "다음"}
                </button>
            </div>
        </section>
    )
}

export default SignUpAuthCode