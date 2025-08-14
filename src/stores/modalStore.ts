import { create } from 'zustand';

// 모달 타입 정의
type ModalType = 'create' | 'join';

// 스토어의 상태와 액션에 대한 타입 정의
interface ModalState {
    activeModal: ModalType | null;
    openModal: (type: ModalType) => void;
    closeModal: () => void;
}

// 스토어 생성
export const useModalStore = create<ModalState>((set) => ({
    // 초기 상태
    activeModal: null,

    // 상태를 변경하는 액션
    openModal: (type) => set({ activeModal: type }),
    closeModal: () => set({ activeModal: null }),
}));