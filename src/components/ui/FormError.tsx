type FormErrorProps = {
  id?: string;
  message?: string | null;
};

export function FormError({ id, message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="ui-field-error" id={id} role="alert">
      {message}
    </p>
  );
}
