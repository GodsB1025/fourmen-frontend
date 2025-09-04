import React from 'react'
import TextInput from '../common/TextInput';
import type { Form } from '../../types/auth';
import { IconLongArrowLeft, IconLongArrowRight } from '../../assets/icons';

interface  SignUpAdminCodeProps {
    f: Form,
    busy: boolean,
    setF: React.Dispatch<React.SetStateAction<Form>>,
    goPrev: () => void,
    goSignUp: () => void,
}


const SignUpAdminCode = ({
    f,
    busy,
    setF,
    goPrev,
    goSignUp,
}: SignUpAdminCodeProps) => {
    return (
        <section className="su-step">
            <TextInput
                value={f.adminKey}
                onChange={(e) => setF({ ...f, adminKey: e.target.value })}
                placeholder="예시: A3ZE48SZ"
            />
            <div className="su-actions">
                <button className='su-btn' onClick={goPrev}>
                    <IconLongArrowLeft/>
                </button>
                <button
                    className="primary su-btn"
                    disabled={busy || f.adminKey===""}
                    onClick={() => goSignUp()}>
                    <IconLongArrowRight/>
                </button>
            </div>
        </section>
    )
}

export default SignUpAdminCode