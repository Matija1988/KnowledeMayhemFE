import { create } from "zustand";
import { createInvalidSessionError, type AuthError } from "../domain/auth";

type ErrorStore = {
  toast: AuthError | null;
  modal: AuthError | null;
  showError: (error: AuthError) => void;
  showInvalidSessionPrompt: () => void;
  clearToast: () => void;
  clearModal: () => void;
  clearAll: () => void;
};

export const useErrorStore = create<ErrorStore>((set) => ({
  toast: null,
  modal: null,
  showError: (error) => {
    if (error.displayMode === "modal") {
      set({ modal: error });
      return;
    }

    set({ toast: error });
  },
  showInvalidSessionPrompt: () => set({ toast: createInvalidSessionError() }),
  clearToast: () => set({ toast: null }),
  clearModal: () => set({ modal: null }),
  clearAll: () => set({ toast: null, modal: null }),
}));

export function resetErrorStoreForTests(): void {
  useErrorStore.setState({ toast: null, modal: null });
}
