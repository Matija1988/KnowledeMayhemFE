import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";

export function useAuthSession() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const invalidReason = useAuthStore((state) => state.invalidReason);
  const storageAvailable = useAuthStore((state) => state.storageAvailable);
  const logout = useAuthStore((state) => state.logout);
  const clearInvalidSession = useAuthStore((state) => state.clearInvalidSession);
  const restoreFromStorage = useAuthStore((state) => state.restoreFromStorage);

  useEffect(() => {
    restoreFromStorage();
  }, [restoreFromStorage]);

  return {
    accessToken,
    isAuthenticated,
    invalidReason,
    storageAvailable,
    logout,
    clearInvalidSession,
  };
}
