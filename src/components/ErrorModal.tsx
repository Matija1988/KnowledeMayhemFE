import { useErrorStore } from "../stores/errorStore";
import { useEffect } from "react";

export function ErrorModal() {
  const modal = useErrorStore((state) => state.modal);
  const clearModal = useErrorStore((state) => state.clearModal);

  useEffect(() => {
    if (!modal) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        clearModal();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [clearModal, modal]);

  if (!modal) {
    return null;
  }

  return (
    <div aria-labelledby="error-modal-title" aria-modal="true" className="modal-backdrop" role="dialog">
      <div className="modal">
        <h2 id="error-modal-title">{modal.title}</h2>
        <p>{modal.message}</p>
        <button type="button" onClick={clearModal}>
          OK
        </button>
      </div>
    </div>
  );
}
