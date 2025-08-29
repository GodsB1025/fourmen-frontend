import React from 'react'
import TextInput from '../common/TextInput';
import type { Form, } from '../../types/auth';
import { IconLongArrowLeft, IconLongArrowRight } from '../../assets/icons';

interface SignUpInfoProps {
    f: Form,
    setF: React.Dispatch<React.SetStateAction<Form>>,
    setErr: React.Dispatch<React.SetStateAction<string | null>>,
    goPrev: () => void,
    goNext: () => void,
    goSignUp: () => void,
}

const SignUpInfo = ({
    f,
    setF,
    setErr,
    goPrev,
    goNext,
    goSignUp,
}: SignUpInfoProps) => {

  const checkInput = () : boolean => {
    if (!f.name.trim()) {
      setErr("이름을 입력하세요.")
      return false
    }
    if (!f.phone.trim()) {
      setErr("연락처를 입력하세요.")
      return false
    }
    if (f.pw.length < 8) {
      setErr("비밀번호는 8자 이상이어야 합니다.")
      return false
    }
    if (f.pw !== f.pw2) {
      setErr("비밀번호가 일치하지 않습니다.")
      return false
    }
    return true
  }

  return (
    <section className="su-step">
        <div className="su-field">
            <label>이름</label>
            <TextInput
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="홍길동"
            autoComplete="name"
            />
        </div>
        <div className="su-field">
          <label>연락처</label>
          <TextInput
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value })}
            placeholder="010-1234-5678"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
        <div className="su-field">
          <label>비밀번호</label>
          <TextInput
            value={f.pw}
            onChange={(e) => setF({ ...f, pw: e.target.value })}
            placeholder="8자 이상"
            type="password"
            autoComplete="new-password"
          />
        </div>
        <div className="su-field">
          <label>비밀번호 확인</label>
          <TextInput
            value={f.pw2}
            onChange={(e) => setF({ ...f, pw2: e.target.value })}
            placeholder="비밀번호 확인"
            type="password"
            autoComplete="new-password"
          />
        </div>
        <div className="su-actions">
          <button className='su-btn' onClick={goPrev}>
            <IconLongArrowLeft/>
          </button>
          <button
            className="primary su-btn"
            onClick={() => {
              if(checkInput()) {
                if (f.type === "ADMIN") goNext();
                else goSignUp()
              }
            }}
          >
            <IconLongArrowRight/>
          </button>
        </div>
    </section>
  )
}

export default SignUpInfo