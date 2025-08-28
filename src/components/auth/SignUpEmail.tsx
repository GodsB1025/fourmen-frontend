import React from 'react'
import TextInput from '../common/TextInput';
import type { Form } from '../../types/auth';
import { IconLongArrowLeft, IconLongArrowRight } from '../../assets/icons';

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
        <TextInput
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            placeholder="test@email.com"
            type="email"
            autoComplete="email"
        />
        <div className="su-actions">
            <button 
                className='su-btn'
                onClick={goPrev}
            >
                <IconLongArrowLeft/>
            </button>
            {/* 👇 이 부분의 disabled 속성이 변경되었습니다. */}
            <button 
                className="primary su-btn" 
                disabled={busy || f.email.trim() === ''} 
                onClick={handleClick}
            >
                <IconLongArrowRight/>
            </button>
        </div>
    </section>
  )
}

export default SignUpEmail