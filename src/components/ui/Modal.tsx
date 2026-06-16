import { useEffect, type ReactNode } from "react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose?: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
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
      <section className="ui-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">{title}</h2>
        {children}
        {onClose ? (
          <button type="button" onClick={onClose}>
            Close
          </button>
        ) : null}
      </section>
    </div>
  );
}
