import { create } from 'zustand';

type ModalType = 'login' | 'register' | 'affiliateRegister' | 'comingSoon' | 'forgotPassword' | null;

interface UiState {
  activeModal: ModalType;
  comingSoonMessage: string;
  liveChatOpen: boolean;
  openModal: (modal: ModalType, message?: string) => void;
  closeModal: () => void;
  openLiveChat: () => void;
  closeLiveChat: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeModal: null,
  comingSoonMessage: 'This feature is coming soon.',
  liveChatOpen: false,

  openModal: (modal, message) =>
    set({
      activeModal: modal,
      comingSoonMessage: message ?? 'This feature is coming soon.',
    }),

  closeModal: () => set({ activeModal: null }),

  openLiveChat: () => set({ liveChatOpen: true }),

  closeLiveChat: () => set({ liveChatOpen: false }),
}));
