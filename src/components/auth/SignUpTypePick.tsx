import React from 'react'
import type { Form } from '../../types/auth';
import { IconUser, IconUserPro } from '../../assets/icons';

type signupType = "USER" | "ADMIN";
interface PickUpProps {
  f: Form,
  setF: React.Dispatch<React.SetStateAction<Form>>,
  setErr: React.Dispatch<React.SetStateAction<string | null>>,
  goNext: () => void,
}

const SignUpTypePick = ({
  f,
  setF,
  goNext,
}: PickUpProps) => {

  const handleClick = ( type: signupType ) => {
    setF((p) => ({ ...p, type}))
    goNext()
  }

  return (
    <section className="su-step su-typepick">
      <div className="su-typegrid">
        {/* 일반 회원 */}
        <button
          type="button"
          className={`su-typecard`}
          aria-pressed={f.type === "USER"}
          onClick={ () => handleClick("USER") }
        >
          <div className="su-typecard-icon" aria-hidden>
            <IconUser/>
          </div>
          <strong className="su-typecard-title">일반 회원가입</strong>
          <p className="su-typecard-desc">
            개인 사용자용입니다. 기본 기능을 바로 시작하세요.
          </p>
        </button>

        {/* 관리자 회원 */}
        <button
          type="button"
          className={`su-typecard`}
          aria-pressed={f.type === "ADMIN"}
          onClick={ () => handleClick("ADMIN") }
        >
          <div className="su-typecard-icon" aria-hidden>
            <IconUserPro/>
          </div>
          <strong className="su-typecard-title">관리자 회원가입</strong>
          <p className="su-typecard-desc">
            조직/관리자용입니다. 팀과 권한을 관리하세요.
          </p>
        </button>
      </div>
    </section>
  )
}

export default SignUpTypePick
