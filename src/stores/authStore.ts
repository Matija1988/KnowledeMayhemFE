import { create } from "zustand";
import {
  createLoggedOutSession,
  isJwtExpired,
  mapLoginResponse,
  type AuthenticatedSession,
} from "../domain/auth";

const STORAGE_KEY = "knowledge-mayhem.auth";

type StoredSession = {
  accessToken: string;
};

type AuthStore = AuthenticatedSession & {
  storageAvailable: boolean;
  isLogoutPending: boolean;
  login: (accessToken: string) => void;
  logout: () => void;
  beginLogout: () => boolean;
  completeLogout: () => void;
  failLogout: () => void;
  clearInvalidSession: (reason: string) => void;
  restoreFromStorage: () => void;
};

function canUseStorage(): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }

  try {
    const testKey = `${STORAGE_KEY}.test`;
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function readStoredSession(): AuthenticatedSession & { storageAvailable: boolean } {
  const storageAvailable = canUseStorage();
  if (!storageAvailable) {
    return { ...createLoggedOutSession(), storageAvailable };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { ...createLoggedOutSession(), storageAvailable };
  }

  try {
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed.accessToken || isJwtExpired(parsed.accessToken)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return { ...createLoggedOutSession("invalid-saved-session"), storageAvailable };
    }

    return { ...mapLoginResponse({ accessToken: parsed.accessToken }), storageAvailable };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return { ...createLoggedOutSession("invalid-saved-session"), storageAvailable };
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...readStoredSession(),
  isLogoutPending: false,
  login: (accessToken) => {
    const session = mapLoginResponse({ accessToken });
    const storageAvailable = canUseStorage();

    if (storageAvailable) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken }));
    }

    set({ ...session, storageAvailable, isLogoutPending: false });
  },
  logout: () => {
    if (canUseStorage()) {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    set({ ...createLoggedOutSession(), storageAvailable: canUseStorage(), isLogoutPending: false });
  },
  beginLogout: () => {
    let didBegin = false;
    set((state) => {
      if (state.isLogoutPending) {
        return state;
      }

      didBegin = true;
      return { isLogoutPending: true };
    });
    return didBegin;
  },
  completeLogout: () => {
    if (canUseStorage()) {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    set({ ...createLoggedOutSession(), storageAvailable: canUseStorage(), isLogoutPending: false });
  },
  failLogout: () => {
    set({ isLogoutPending: false });
  },
  clearInvalidSession: (reason) => {
    if (canUseStorage()) {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    set({ ...createLoggedOutSession(reason), storageAvailable: canUseStorage(), isLogoutPending: false });
  },
  restoreFromStorage: () => {
    set({ ...readStoredSession(), isLogoutPending: false });
  },
}));

export function resetAuthStoreForTests(): void {
  if (canUseStorage()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  useAuthStore.setState({ ...createLoggedOutSession(), storageAvailable: canUseStorage(), isLogoutPending: false });
}

export const authStorageKey = STORAGE_KEY;
