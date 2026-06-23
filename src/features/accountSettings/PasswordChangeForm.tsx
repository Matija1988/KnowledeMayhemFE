import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";
import type { AccountSettingsError, ChangePasswordRequest } from "../../domain/accountSettings/accountSettingsTypes";

type PasswordChangeFormProps = {
  error: AccountSettingsError | null;
  isLoading: boolean;
  onSubmit: (request: ChangePasswordRequest) => Promise<boolean>;
};

const emptyForm: ChangePasswordRequest = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export function PasswordChangeForm({ error, isLoading, onSubmit }: PasswordChangeFormProps) {
  const [form, setForm] = useState<ChangePasswordRequest>(emptyForm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const changed = await onSubmit(form);
    if (changed) {
      setForm(emptyForm);
    }
  }

  return (
    <Card aria-labelledby="password-settings-heading">
      <h2 id="password-settings-heading">Password</h2>
      <form className="account-settings-form" onSubmit={(event) => void handleSubmit(event)}>
        <FormField
          id="current-password"
          label="Current password"
          error={error?.field === "currentPassword" ? error.message : undefined}
        >
          <Input
            id="current-password"
            type="password"
            value={form.currentPassword}
            autoComplete="current-password"
            aria-describedby={error?.field === "currentPassword" ? "current-password-error" : undefined}
            onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))}
          />
        </FormField>
        <FormField id="new-password" label="New password" error={error?.field === "newPassword" ? error.message : undefined}>
          <Input
            id="new-password"
            type="password"
            value={form.newPassword}
            autoComplete="new-password"
            aria-describedby={error?.field === "newPassword" ? "new-password-error" : undefined}
            onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))}
          />
        </FormField>
        <FormField
          id="confirm-new-password"
          label="Confirm new password"
          error={error?.field === "confirmNewPassword" ? error.message : undefined}
        >
          <Input
            id="confirm-new-password"
            type="password"
            value={form.confirmNewPassword}
            autoComplete="new-password"
            aria-describedby={error?.field === "confirmNewPassword" ? "confirm-new-password-error" : undefined}
            onChange={(event) => setForm((current) => ({ ...current, confirmNewPassword: event.target.value }))}
          />
        </FormField>
        {error && !error.field ? (
          <p className="ui-field-error" role="alert">
            {error.message}
          </p>
        ) : null}
        <Button type="submit" isLoading={isLoading}>
          Change password
        </Button>
      </form>
    </Card>
  );
}
