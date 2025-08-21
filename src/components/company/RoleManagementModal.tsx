import React, { useState } from "react";
import type { CompanyMember, MemberRole } from "../../apis/Company";
import "./RoleManagementModal.css";

const roleLabel: Record<MemberRole, string> = {
    ADMIN: "관리자",
    CONTRACT_ADMIN: "계약 관리자",
    USER: "일반 직원",
};

type Props = {
    member: CompanyMember;
    allowedRoles: MemberRole[];
    onClose: () => void;
    onSave: (newRole: MemberRole) => void | Promise<void>;
};

export default function RoleManagementModal({ member, allowedRoles, onClose, onSave }: Props) {
    const [selectedRole, setSelectedRole] = useState<MemberRole>(member.role);
    const [busy, setBusy] = useState(false);

    const handleSave = async () => {
        if (selectedRole === member.role) {
            onClose();
            return;
        }
        setBusy(true);
        try {
            await onSave(selectedRole);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="role-modal-backdrop" onClick={onClose}>
            <div className="role-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="role-modal-header">
                    <h2>권한 변경</h2>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </header>

                <section className="role-modal-body">
                    <div className="member-target-info">
                        <span className="member-name">{member.name}</span>
                        <span className="member-email">{member.email}</span>
                    </div>
                    <p className="current-role-text">
                        현재 권한: <strong>{roleLabel[member.role]}</strong>
                    </p>

                    <fieldset className="role-selection-group">
                        <legend>변경할 권한을 선택하세요</legend>
                        {allowedRoles.map((role) => (
                            <label key={role} className="role-radio-label">
                                <input type="radio" name="role" value={role} checked={selectedRole === role} onChange={() => setSelectedRole(role)} />
                                <span className="radio-custom"></span>
                                <span className="role-text">{roleLabel[role]}</span>
                            </label>
                        ))}
                    </fieldset>
                </section>

                <footer className="role-modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        취소
                    </button>
                    <button className="confirm-btn" onClick={handleSave} disabled={busy || selectedRole === member.role}>
                        {busy ? "저장 중..." : "저장"}
                    </button>
                </footer>
            </div>
        </div>
    );
}
