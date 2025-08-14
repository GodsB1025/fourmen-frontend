import React from 'react'

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

interface  PickUpProps {
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
                onClick={() => setF((p) => ({ ...p, type: "USER" }))}
                >
                <div className="su-typecard-icon" aria-hidden>
                    <svg viewBox="0 0 24 24">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z" />
                    <path d="M20 7h-1V6a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0V9h1a1 1 0 100-2z" />
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
                onClick={() => setF((p) => ({ ...p, type: "ADMIN" }))}
                >
                <div className="su-typecard-icon" aria-hidden>
                    <svg viewBox="0 0 24 24">
                    <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                    <path d="M4 20v-1c0-3.314 3.582-6 8-6s8 2.686 8 6v1H4z" />
                    <circle cx="17.5" cy="7.5" r="2.5" />
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
            }}>
            다음
            </button>
        </div>
        </section>
    )
}

export default SignUpTypePick