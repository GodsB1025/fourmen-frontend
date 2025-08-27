import React from 'react'
import TextInput from '../common/TextInput';
import type { Form, Step } from '../../types/auth';

interface  SignUpAdminCodeProps {
    f: Form,
    busy: boolean,
    setF: React.Dispatch<React.SetStateAction<Form>>,
    setBusy: React.Dispatch<React.SetStateAction<boolean>>,
    setErr: React.Dispatch<React.SetStateAction<string | null>>,
    setStep: React.Dispatch<React.SetStateAction<Step>>,
    goPrev: () => void,
    goSignUp: () => void,
}


const SignUpAdminCode = ({
    f,
    busy,
    setF,
    setBusy,
    setErr,
    goPrev,
}: SignUpAdminCodeProps) => {
    return (
        <section className="su-step">
            <TextInput
                value={f.adminKey}
                onChange={(e) => setF({ ...f, adminKey: e.target.value })}
                placeholder="A3ZE48SZ"
            />
            <div className="su-actions">
                <button className='su-btn' onClick={goPrev}>이전</button>
                <button
                    className="primary su-btn"
                    disabled={busy}
                    onClick={async () => {
                    setErr(null); setBusy(true);
                    try {
                        // 필요하면 실제 관리자 코드 검증 API 연동
                        if (!f.adminKey.trim()) throw new Error("관리자 코드를 입력하세요.");
                    } catch (e: any) {
                        setErr(e?.message || "관리자 코드가 올바르지 않습니다.");
                    } finally {
                        setBusy(false);
                    }
                }}>
                    {busy ? "확인중..." : "다음"}
                </button>
            </div>
        </section>
    )
}

export default SignUpAdminCode