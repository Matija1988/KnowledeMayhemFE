type LoadingSpinnerProps = {
  label?: string;
};

export function LoadingSpinner({ label = "Loading" }: LoadingSpinnerProps) {
  return (
    <span className="ui-spinner" role="status" aria-live="polite">
      <span aria-hidden="true" className="ui-spinner__mark" />
      <span>{label}</span>
    </span>
  );
}
