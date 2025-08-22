import React from 'react'
import type { Form } from '../../types/auth';

interface PickUpProps {
  f: Form,
  setF: React.Dispatch<React.SetStateAction<Form>>,
  setErr: React.Dispatch<React.SetStateAction<string | null>>,
  goNext: () => void,
}

const SignUpTypePick = ({
  f,
  setF,
  setErr,
  goNext,
}: PickUpProps) => {
  return (
    <section className="su-step su-typepick">
      <div className="su-typegrid">
        {/* 일반 회원 */}
        <button
          type="button"
          className={`su-typecard ${f.type === "USER" ? "active" : ""}`}
          aria-pressed={f.type === "USER"}
          onClick={() => setF((p) => ({ ...p, type: "USER" }))}
        >
          <div className="su-typecard-icon" aria-hidden>
            {/* 더 큰 유저+플러스 아이콘 */}
            <svg viewBox="0 0 128 128" width="120" height="120"
                 fill="none" stroke="currentColor" strokeWidth="12"
                 strokeLinecap="round" strokeLinejoin="round">
              <circle cx="56" cy="40" r="20" />
              <path d="M24 96c8-16 56-16 64 0" />
              <path d="M96 32v16M88 40h16" />
            </svg>
          </div>
          <strong className="su-typecard-title">일반 회원가입</strong>
          <p className="su-typecard-desc">
            개인 사용자용입니다. 기본 기능을 바로 시작하세요.
          </p>
        </button>

        {/* 관리자 회원 */}
        <button
          type="button"
          className={`su-typecard ${f.type === "ADMIN" ? "active" : ""}`}
          aria-pressed={f.type === "ADMIN"}
          onClick={() => setF((p) => ({ ...p, type: "ADMIN" }))}
        >
          <div className="su-typecard-icon" aria-hidden>
            {/* 더 큰 관리자 아이콘 */}
            <svg viewBox="0 0 128 128" width="120" height="120"
                 fill="none" stroke="currentColor" strokeWidth="12"
                 strokeLinecap="round" strokeLinejoin="round">
              <circle cx="64" cy="36" r="18" />
              <path d="M24 96c8-20 72-20 80 0" />
              <path d="M44 80v28M84 80v28" />
              <path d="M58 80l6 10l6-10" />
            </svg>
          </div>
          <strong className="su-typecard-title">관리자 회원가입</strong>
          <p className="su-typecard-desc">
            조직/관리자용입니다. 팀과 권한을 관리하세요.
          </p>
        </button>
      </div>

      <div className="su-actions">
        <button
          className="primary"
          onClick={() => {
            if (!f.type) return setErr("가입 유형을 선택하세요.");
            setErr(null);
            goNext();
          }}
        >
          다음
        </button>
      </div>
    </section>
  )
}

export default SignUpTypePick
