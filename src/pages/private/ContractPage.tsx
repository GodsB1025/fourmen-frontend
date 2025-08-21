// ALL/frontend/pages/private/ContractPage.tsx
import React, { useEffect, useState } from "react";
import { getContractTemplate, getCompletedContracts } from "../../apis/Contract";
import type { Contract, CompletedContract } from "../../apis/Types";
import { useModalStore } from "../../stores/modalStore";
import { useAuthStore } from "../../stores/authStore";
import SkeletonCard from "../../components/contract/SkeletonCard";
import ContractCard from "../../components/contract/ContractCard";

// 페이지 CSS와 함께, 카드 컴포넌트의 새로운 CSS를 명시적으로 import 합니다.
import "./ContractPage.css";
import "../../components/contract/ContractCard.css";

const ContractPage = () => {
    const openModal = useModalStore((state) => state.openModal);
    const user = useAuthStore((state) => state.user);
    const baseURL = import.meta.env.VITE_API_BASE_URL as string;

    const [activeTab, setActiveTab] = useState<"templates" | "completed">("templates");
    const [templates, setTemplates] = useState<Contract[]>([]);
    const [completedContracts, setCompletedContracts] = useState<CompletedContract[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasPermission = user?.role === "ADMIN" || user?.role === "CONTRACT_ADMIN";

    useEffect(() => {
        if (!hasPermission) return;

        setBusy(true);
        setError(null);

        const loader = activeTab === "templates" ? loadTemplates : loadCompletedContracts;
        loader().finally(() => setBusy(false));
    }, [activeTab, hasPermission]);

    const loadTemplates = async () => {
        try {
            const data = await getContractTemplate();
            setTemplates(data);
        } catch (err) {
            setError("템플릿을 불러오는 데 실패했습니다.");
            setTemplates([]);
        }
    };

    const loadCompletedContracts = async () => {
        try {
            const data = await getCompletedContracts();
            setCompletedContracts(data);
        } catch (err) {
            setError("완료된 계약서를 불러오는 데 실패했습니다.");
            setCompletedContracts([]);
        }
    };

    const openContractModal = (contract: Contract) => {
        openModal("contractForm", {
            templateId: String(contract.templateId),
            eformsignTemplateId: contract.eformsignTemplateId,
        });
    };

    if (!hasPermission) {
        return (
            <div className="contract-page-guard">
                <h2>접근 권한 없음</h2>
                <p>전자 계약 기능은 관리자 또는 계약 관리자만 사용할 수 있습니다.</p>
            </div>
        );
    }

    return (
        <div className="contract-page">
            <header className="contract-header">
                <h1>전자 계약</h1>
                <nav className="contract-tabs">
                    <button className={`tab-btn ${activeTab === "templates" ? "active" : ""}`} onClick={() => setActiveTab("templates")}>
                        템플릿
                    </button>
                    <button className={`tab-btn ${activeTab === "completed" ? "active" : ""}`} onClick={() => setActiveTab("completed")}>
                        완료된 계약
                    </button>
                </nav>
            </header>

            <main className="contract-content">
                {error && <p className="error-message">{error}</p>}

                <div className="card-grid">
                    {busy
                        ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
                        : activeTab === "templates"
                        ? templates.map((template) => (
                              <ContractCard key={template.templateId} contract={template} handleClick={() => openContractModal(template)} />
                          ))
                        : completedContracts.map((contract) => {
                              const imageUrl = `${baseURL}${contract.fileUrlBase}.png`;
                              const pdfUrl = `${baseURL}${contract.fileUrlBase}.pdf`;

                              return (
                                  <a key={contract.contractId} href={pdfUrl} target="_blank" rel="noopener noreferrer" className="card-item">
                                      <div className="card-item__figure">
                                          <img src={imageUrl} alt={contract.title} className="card-item__image" />
                                      </div>
                                      <div className="card-item__body">
                                          <p className="card-item__title">{contract.title}</p>
                                          <span className="card-item__date">{new Date(contract.completedAt).toLocaleDateString()}</span>
                                      </div>
                                  </a>
                              );
                          })}
                </div>
            </main>
        </div>
    );
};

export default ContractPage;
