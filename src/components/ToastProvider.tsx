import { useErrorStore } from "../stores/errorStore";

export function ToastProvider() {
  const toast = useErrorStore((state) => state.toast);
  const clearToast = useErrorStore((state) => state.clearToast);

  if (!toast) {
    return null;
  }

  return (
    <aside aria-live="assertive" className="toast" role="status">
      <strong>{toast.title}</strong>
      <span>{toast.message}</span>
      <button aria-label="Dismiss message" type="button" onClick={clearToast}>
        Dismiss
      </button>
    </aside>
  );
}
