import React, { useState } from "react";
import type { MemberRole } from "../../apis/Company";

type Props = {
  onSubmit: (p: { email: string; role: MemberRole }) => void | Promise<void>;
};

export default function InviteMemberForm({ onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("USER");
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    const trimmed = email.trim();
    if (!trimmed) return alert("이메일을 입력하세요.");
    setBusy(true);
    try {
      await onSubmit({ email: trimmed, role });
      setEmail("");
      setRole("USER");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="invite-form">
      <input
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <select value={role} onChange={(e) => setRole(e.target.value as MemberRole)}>
        <option value="USER">USER</option>
        <option value="CONTRACT_ADMIN">CONTRACT_ADMIN</option>
      </select>
      {/* 절대 submit 되지 않도록 button */}
      <button type="button" onClick={handleClick} disabled={busy}>
        {busy ? "초대중..." : "초대하기"}
      </button>
    </div>
  );
}
