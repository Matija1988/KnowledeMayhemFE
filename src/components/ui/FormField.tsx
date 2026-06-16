import type { ReactNode } from "react";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="ui-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className="ui-field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
