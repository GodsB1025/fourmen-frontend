import React from 'react'
import TextInput from '../common/TextInput';
import type { Form } from '../../types/auth';
import { IconLongArrowLeft, IconLongArrowRight } from '../../assets/icons';

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
            <TextInput
            value={f.code}
            onChange={(e) => setF({ ...f, code: e.target.value.replace(/\D/g, "") })}
            placeholder="인증코드"
            inputMode="numeric"
            maxLength={6}
            />
            <div className="su-actions">
                <button className='su-btn' onClick={goPrev}>
                    <IconLongArrowLeft/>
                </button>
                <button className="primary su-btn" disabled={busy} onClick={handleClick}>
                    <IconLongArrowRight/>
                </button>
            </div>
        </section>
    )
}

export default SignUpAuthCode