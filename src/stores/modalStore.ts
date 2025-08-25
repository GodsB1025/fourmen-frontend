import { create } from "zustand";

// 모달 타입 정의 (aiAssistant 추가)
type ModalType = "create" | "join" | "contractForm" | "aiAssistant" | "sharingURL";

// 모달에 전달할 데이터 타입을 확장 가능하게 정의
interface ModalData {
    templateId?: string;
    eformsignTemplateId?: string; // eformsignTemplateId 추가
    sharingURL?: string | null;
}

// 스토어의 상태와 액션에 대한 타입 정의
interface ModalState {
    activeModal: ModalType | null;
    modalData: ModalData | null;
    openModal: (type: ModalType, data?: ModalData) => void;
    closeModal: () => void;
}

// 스토어 생성
export const useModalStore = create<ModalState>((set) => ({
    // 초기 데이터는 null
    activeModal: null,
    modalData: null,

    openModal: (type, data?) => set({ activeModal: type, modalData: data }), // 데이터를 함께 저장
    closeModal: () => set({ activeModal: null, modalData: null }), // 닫을 때 데이터도 초기화
}));
