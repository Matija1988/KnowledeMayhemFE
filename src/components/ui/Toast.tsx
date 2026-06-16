import type { ReactNode } from "react";

type ToastProps = {
  title: string;
  children: ReactNode;
  onDismiss?: () => void;
};

export function Toast({ title, children, onDismiss }: ToastProps) {
  return (
    <aside className="ui-toast" role="status" aria-live="polite">
      <strong>{title}</strong>
      <div>{children}</div>
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label="Dismiss notification">
          Dismiss
        </button>
      ) : null}
    </aside>
  );
}
