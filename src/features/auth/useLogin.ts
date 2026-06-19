import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest, normalizeIdentityError } from "../../api/identityApi";
import {
  getDefaultAuthenticatedPath,
  hasLoginFieldErrors,
  normalizeCredentials,
  validateLoginCredentials,
  type LoginCredentials,
  type LoginFieldErrors,
} from "../../domain/auth";
import { useAuthStore } from "../../stores/authStore";
import { useErrorStore } from "../../stores/errorStore";
import { useLoadingStore } from "../../stores/loadingStore";

export function useLogin() {
  const navigate = useNavigate();
  const isLoading = useLoadingStore((state) => state.isLoading && state.operation === "login");
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const loginSession = useAuthStore((state) => state.login);
  const showError = useErrorStore((state) => state.showError);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  async function submit(credentials: LoginCredentials): Promise<boolean> {
    if (isLoading) {
      return false;
    }

    const errors = validateLoginCredentials(credentials);
    setFieldErrors(errors);
    if (hasLoginFieldErrors(errors)) {
      return false;
    }

    showLoading("login");
    try {
      const response = await loginRequest(normalizeCredentials(credentials));
      loginSession(response.accessToken);
      navigate(getDefaultAuthenticatedPath(response.accessToken), { replace: true });
      return true;
    } catch (error) {
      showError(normalizeIdentityError(error));
      return false;
    } finally {
      hideLoading();
    }
  }

  return { submit, isLoading, fieldErrors };
}
