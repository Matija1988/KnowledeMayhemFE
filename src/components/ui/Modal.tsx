import { useEffect, type ReactNode } from "react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
  closeButtonVariant?: "text" | "icon";
};

export function Modal({ title, children, onClose, className = "", closeButtonVariant = "text" }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="ui-modal-backdrop" role="presentation">
      <section className={`ui-modal ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">{title}</h2>
        {children}
        {onClose ? (
          <button
            type="button"
            className={closeButtonVariant === "icon" ? "ui-modal-close-icon" : undefined}
            aria-label={closeButtonVariant === "icon" ? "Close" : undefined}
            onClick={onClose}
          >
            {closeButtonVariant === "icon" ? <span aria-hidden="true">×</span> : "Close"}
          </button>
        ) : null}
      </section>
    </div>
  );
}
