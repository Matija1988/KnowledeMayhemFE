import { useNavigate } from "react-router-dom";
import { logout as logoutRequest, normalizeLogoutError } from "../../api/identityApi";
import { useAuthStore } from "../../stores/authStore";
import { useErrorStore } from "../../stores/errorStore";
import { useLoadingStore } from "../../stores/loadingStore";

export function useLogout() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLogoutPending = useAuthStore((state) => state.isLogoutPending);
  const beginLogout = useAuthStore((state) => state.beginLogout);
  const completeLogout = useAuthStore((state) => state.completeLogout);
  const failLogout = useAuthStore((state) => state.failLogout);
  const showError = useErrorStore((state) => state.showError);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  async function submit(): Promise<boolean> {
    if (!accessToken) {
      completeLogout();
      navigate("/login", { replace: true });
      return true;
    }

    if (!beginLogout()) {
      return false;
    }

    showLoading("logout");
    try {
      await logoutRequest(accessToken);
      completeLogout();
      navigate("/login", { replace: true });
      return true;
    } catch (error) {
      const normalized = normalizeLogoutError(error);
      if (normalized.title === "Session ended") {
        completeLogout();
        navigate("/login", { replace: true });
        return true;
      }

      failLogout();
      showError(normalized);
      return false;
    } finally {
      hideLoading();
    }
  }

  return { submit, isLoading: isLogoutPending };
}
