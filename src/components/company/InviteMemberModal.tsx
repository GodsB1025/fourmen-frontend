import { useState } from "react";
import type { MemberRole } from "../../apis/Types";
import "./InviteMemberModal.css";
import Toast from "../common/Toast"; // Toast 컴포넌트 import

type PendingInvite = {
    email: string;
    role: MemberRole;
};

type Props = {
    onClose: () => void;
    onInvite: (invites: PendingInvite[]) => void | Promise<void>;
};

export default function InviteMemberModal({ onClose, onInvite }: Props) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<MemberRole>("USER");
    const [pending, setPending] = useState<PendingInvite[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null); // 에러 메시지 상태 추가

    const handleAdd = () => {
        const trimmed = email.trim();
        if (!trimmed || !trimmed.includes("@")) {
            setError("올바른 이메일 주소를 입력하세요."); // alert 대신 setError 사용
            return;
        }
        if (pending.some((p) => p.email.toLowerCase() === trimmed.toLowerCase())) {
            setError("이미 추가된 이메일입니다."); // alert 대신 setError 사용
            return;
        }

        setPending((prev) => [...prev, { email: trimmed, role }]);
        setEmail("");
        setRole("USER");
    };

    const handleRemove = (emailToRemove: string) => {
        setPending((prev) => prev.filter((p) => p.email !== emailToRemove));
    };

    const handleSendInvites = async () => {
        if (pending.length === 0) return;
        setBusy(true);
        try {
            await onInvite(pending);
            onClose();
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <div className="invite-modal-backdrop" onClick={onClose}>
                <div className="invite-modal-content" onClick={(e) => e.stopPropagation()}>
                    <header className="invite-modal-header">
                        <h2>멤버 초대하기</h2>
                        <button className="invite-close-button" onClick={onClose}>
                            &times;
                        </button>
                    </header>

                    <section className="invite-modal-body">
                        <div className="invite-form">
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            />
                            <select value={role} onChange={(e) => setRole(e.target.value as MemberRole)}>
                                <option value="USER">일반 직원</option>
                                <option value="CONTRACT_ADMIN">계약 관리자</option>
                            </select>
                            <button type="button" onClick={handleAdd}>
                                + 추가
                            </button>
                        </div>

                        <div className="pending-list-container">
                            <h4>초대할 멤버 ({pending.length}명)</h4>
                            {pending.length > 0 ? (
                                <ul className="pending-list">
                                    {pending.map((p) => (
                                        <li key={p.email}>
                                            <span>
                                                {p.email} ({p.role})
                                            </span>
                                            <button onClick={() => handleRemove(p.email)}>&times;</button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-pending-text">추가된 멤버가 없습니다.</p>
                            )}
                        </div>
                    </section>

                    <footer className="invite-modal-footer">
                        <button className="cancel-btn" onClick={onClose}>
                            취소
                        </button>
                        <button className="confirm-btn" onClick={handleSendInvites} disabled={busy || pending.length === 0}>
                            {busy ? "초대 중..." : "초대 보내기"}
                        </button>
                    </footer>
                </div>
            </div>
            {error && <Toast message={error} onClose={() => setError(null)} type="error" />}
        </>
    );
}
