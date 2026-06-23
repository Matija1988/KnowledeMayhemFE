import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  changeCurrentUserPassword,
  deactivateCurrentUser,
  getCurrentUserProfile,
  normalizeAccountSettingsError,
  updateAccountIdentity,
} from "../../api/accountSettingsApi";
import type {
  AccountSettingsError,
  ChangePasswordRequest,
  CurrentUserProfile,
  DeactivateAccountRequest,
  UpdateAccountIdentityRequest,
} from "../../domain/accountSettings/accountSettingsTypes";
import { useAuthStore } from "../../stores/authStore";
import { useErrorStore } from "../../stores/errorStore";
import { useLoadingStore } from "../../stores/loadingStore";

type Status = {
  profile: AccountSettingsError | null;
  identity: AccountSettingsError | null;
  password: AccountSettingsError | null;
  deactivation: AccountSettingsError | null;
  success: string | null;
};

const initialStatus: Status = {
  profile: null,
  identity: null,
  password: null,
  deactivation: null,
  success: null,
};

export function useAccountSettings() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearInvalidSession = useAuthStore((state) => state.clearInvalidSession);
  const completeLogout = useAuthStore((state) => state.completeLogout);
  const showError = useErrorStore((state) => state.showError);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const loadingOperation = useLoadingStore((state) => state.operation);
  const isLoading = useLoadingStore((state) => state.isLoading);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [status, setStatus] = useState<Status>(initialStatus);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      if (!accessToken) {
        clearInvalidSession("missing-session");
        navigate("/login", { replace: true });
        return;
      }

      showLoading("readAccountSettings");
      try {
        const loadedProfile = await getCurrentUserProfile(accessToken);
        if (isMounted) {
          setProfile(loadedProfile);
          setStatus((current) => ({ ...current, profile: null }));
        }
      } catch (error) {
        const normalized = normalizeAccountSettingsError(error);
        if (normalized.isSessionInvalid) {
          clearInvalidSession("account-settings-session-invalid");
          navigate("/login", { replace: true });
          return;
        }

        if (isMounted) {
          setStatus((current) => ({ ...current, profile: normalized }));
        }
        showError({ title: normalized.title, message: normalized.message, displayMode: "toast" });
      } finally {
        hideLoading();
      }
    }

    void loadProfile();
    return () => {
      isMounted = false;
    };
  }, [accessToken, clearInvalidSession, hideLoading, navigate, showError, showLoading]);

  async function saveIdentity(request: UpdateAccountIdentityRequest): Promise<boolean> {
    if (!accessToken) {
      clearInvalidSession("missing-session");
      navigate("/login", { replace: true });
      return false;
    }

    const validation = validateIdentity(request);
    if (validation) {
      setStatus((current) => ({ ...current, identity: validation, success: null }));
      return false;
    }

    showLoading("updateAccountIdentity");
    try {
      const updatedProfile = await updateAccountIdentity(accessToken, request);
      setProfile(updatedProfile);
      setStatus((current) => ({ ...current, identity: null, success: "Profile changes saved." }));
      return true;
    } catch (error) {
      return handleActionError(error, "identity");
    } finally {
      hideLoading();
    }
  }

  async function changePassword(request: ChangePasswordRequest): Promise<boolean> {
    if (!accessToken) {
      clearInvalidSession("missing-session");
      navigate("/login", { replace: true });
      return false;
    }

    const validation = validatePassword(request);
    if (validation) {
      setStatus((current) => ({ ...current, password: validation, success: null }));
      return false;
    }

    showLoading("changePassword");
    try {
      await changeCurrentUserPassword(accessToken, request);
      setStatus((current) => ({ ...current, password: null, success: "Password changed. Other sessions were signed out." }));
      return true;
    } catch (error) {
      return handleActionError(error, "password");
    } finally {
      hideLoading();
    }
  }

  async function deactivateAccount(request: DeactivateAccountRequest): Promise<boolean> {
    if (!accessToken) {
      clearInvalidSession("missing-session");
      navigate("/login", { replace: true });
      return false;
    }

    const validation = validateDeactivation(request);
    if (validation) {
      setStatus((current) => ({ ...current, deactivation: validation, success: null }));
      return false;
    }

    showLoading("deactivateAccount");
    try {
      await deactivateCurrentUser(accessToken, request);
      completeLogout();
      navigate("/login", { replace: true });
      return true;
    } catch (error) {
      return handleActionError(error, "deactivation");
    } finally {
      hideLoading();
    }
  }

  function handleActionError(error: unknown, area: keyof Pick<Status, "identity" | "password" | "deactivation">): boolean {
    const normalized = normalizeAccountSettingsError(error);
    if (normalized.isSessionInvalid) {
      clearInvalidSession("account-settings-session-invalid");
      navigate("/login", { replace: true });
      return false;
    }

    setStatus((current) => ({ ...current, [area]: normalized, success: null }));
    showError({ title: normalized.title, message: normalized.message, displayMode: "toast" });
    return false;
  }

  return {
    profile,
    status,
    saveIdentity,
    changePassword,
    deactivateAccount,
    isLoading,
    loadingOperation,
  };
}

function validateIdentity(request: UpdateAccountIdentityRequest): AccountSettingsError | null {
  if (!request.username.trim()) {
    return { title: "Username required", message: "Username is required.", field: "username" };
  }

  if (request.username.trim().length > 50) {
    return { title: "Username too long", message: "Username must be 50 characters or fewer.", field: "username" };
  }

  if (!request.email.trim()) {
    return { title: "Email required", message: "Email is required.", field: "email" };
  }

  if (request.email.trim().length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email.trim())) {
    return { title: "Email invalid", message: "Enter a valid email address.", field: "email" };
  }

  return null;
}

function validatePassword(request: ChangePasswordRequest): AccountSettingsError | null {
  if (!request.currentPassword) {
    return { title: "Current password required", message: "Current password is required.", field: "currentPassword" };
  }

  if (!request.newPassword) {
    return { title: "New password required", message: "New password is required.", field: "newPassword" };
  }

  if (request.newPassword !== request.confirmNewPassword) {
    return { title: "Password mismatch", message: "New password and confirmation do not match.", field: "confirmNewPassword" };
  }

  return null;
}

function validateDeactivation(request: DeactivateAccountRequest): AccountSettingsError | null {
  if (!request.password) {
    return { title: "Password required", message: "Password is required.", field: "password" };
  }

  if (request.confirmationText !== "DEACTIVATE") {
    return { title: "Confirmation required", message: "Enter DEACTIVATE exactly as shown.", field: "confirmationText" };
  }

  return null;
}
