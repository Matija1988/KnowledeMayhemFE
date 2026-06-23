import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";
import type { AccountSettingsError, DeactivateAccountRequest } from "../../domain/accountSettings/accountSettingsTypes";

type DangerZoneProps = {
  error: AccountSettingsError | null;
  isLoading: boolean;
  onSubmit: (request: DeactivateAccountRequest) => Promise<boolean>;
};

const emptyForm: DeactivateAccountRequest = {
  password: "",
  confirmationText: "",
};

export function DangerZone({ error, isLoading, onSubmit }: DangerZoneProps) {
  const [form, setForm] = useState<DeactivateAccountRequest>(emptyForm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <Card className="account-settings-danger" aria-labelledby="danger-zone-heading">
      <h2 id="danger-zone-heading">Danger zone</h2>
      <p className="account-settings-warning">
        Account deactivation may leave active lobbies or forfeit active games. Type uppercase DEACTIVATE to confirm.
      </p>
      <form className="account-settings-form" onSubmit={(event) => void handleSubmit(event)}>
        <FormField id="deactivation-password" label="Password" error={error?.field === "password" ? error.message : undefined}>
          <Input
            id="deactivation-password"
            type="password"
            value={form.password}
            autoComplete="current-password"
            aria-describedby={error?.field === "password" ? "deactivation-password-error" : undefined}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </FormField>
        <FormField
          id="deactivation-confirmation"
          label="Confirmation text"
          error={error?.field === "confirmationText" ? error.message : undefined}
        >
          <Input
            id="deactivation-confirmation"
            value={form.confirmationText}
            aria-describedby={error?.field === "confirmationText" ? "deactivation-confirmation-error" : undefined}
            onChange={(event) => setForm((current) => ({ ...current, confirmationText: event.target.value }))}
          />
        </FormField>
        {error && !error.field ? (
          <p className="ui-field-error" role="alert">
            {error.message}
          </p>
        ) : null}
        <Button type="submit" variant="danger" isLoading={isLoading}>
          Deactivate account
        </Button>
      </form>
    </Card>
  );
}
