import React, { useState } from "react";
import "./AiAssistantContent.css";
import ai_image from '../../assets/imgs/ai_sparkle.svg'
import { searchIntelligence } from "../../apis/Intelligence";
import ActionButton from "../common/ActionButton";

const AiAssistantContent = () => {
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setBusy(true);
        setError(null);
        setAnswer("");

        try {
            const result = await searchIntelligence(query);
            setAnswer(result);
        } catch (err: any) {
            setError(err.message || "검색 중 오류가 발생했습니다.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="ai-assistant-container">
            <div className="ai-assistant-body">
                {answer ? (
                    <div className="answer-section">
                        <p className="answer-text">{answer}</p>
                    </div>
                ) : (
                    <div className="placeholder-section">
                        <div className="placeholder-icon">
                            <img src={ai_image} alt="ai아이콘" />
                        </div>
                        <h3 className="placeholder-title">무엇이 궁금하신가요?</h3>
                        <p className="placeholder-desc">
                            회의록 내용을 기반으로 답변해 드립니다.
                            <br />
                            예: "지난 분기 실적 리뷰 회의의 핵심 결론은 무엇인가요?"
                        </p>
                    </div>
                )}
            </div>
            <form className="ai-assistant-form" onSubmit={handleSubmit}>
                <textarea
                    className="query-textarea"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="질문을 입력하세요..."
                    rows={3}
                    disabled={busy}
                />
                <ActionButton type="submit" isActive={!busy && query.trim().length > 0}>
                    {busy ? "검색 중..." : "질문하기"}
                </ActionButton>
            </form>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default AiAssistantContent;
