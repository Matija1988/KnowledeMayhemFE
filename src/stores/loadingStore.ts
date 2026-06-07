import { create } from "zustand";
import type { LoadingState } from "../domain/auth";

type LoadingStore = LoadingState & {
  showLoading: (operation: LoadingState["operation"]) => void;
  hideLoading: () => void;
};

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  operation: null,
  showLoading: (operation) => set({ isLoading: true, operation }),
  hideLoading: () => set({ isLoading: false, operation: null }),
}));

export function resetLoadingStoreForTests(): void {
  useLoadingStore.setState({ isLoading: false, operation: null });
}
