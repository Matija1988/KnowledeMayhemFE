import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";
import type { AccountSettingsError, CurrentUserProfile } from "../../domain/accountSettings/accountSettingsTypes";

type ProfileSettingsFormProps = {
  profile: CurrentUserProfile;
  error: AccountSettingsError | null;
  isLoading: boolean;
  onSubmit: (request: { username: string; email: string }) => Promise<boolean>;
};

export function ProfileSettingsForm({ profile, error, isLoading, onSubmit }: ProfileSettingsFormProps) {
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);

  useEffect(() => {
    setUsername(profile.username);
    setEmail(profile.email);
  }, [profile.email, profile.username]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ username, email });
  }

  return (
    <Card aria-labelledby="profile-settings-heading">
      <h2 id="profile-settings-heading">Profile</h2>
      <dl className="account-settings-summary">
        <div>
          <dt>Role</dt>
          <dd>{profile.role}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{new Date(profile.createdAt).toLocaleDateString()}</dd>
        </div>
      </dl>
      <form className="account-settings-form" onSubmit={(event) => void handleSubmit(event)}>
        <FormField id="account-username" label="Username" error={error?.field === "username" ? error.message : undefined}>
          <Input
            id="account-username"
            value={username}
            maxLength={50}
            autoComplete="username"
            aria-describedby={error?.field === "username" ? "account-username-error" : undefined}
            onChange={(event) => setUsername(event.target.value)}
          />
        </FormField>
        <FormField id="account-email" label="Email" error={error?.field === "email" ? error.message : undefined}>
          <Input
            id="account-email"
            type="email"
            value={email}
            maxLength={255}
            autoComplete="email"
            aria-describedby={error?.field === "email" ? "account-email-error" : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>
        {error && !error.field ? (
          <p className="ui-field-error" role="alert">
            {error.message}
          </p>
        ) : null}
        <Button type="submit" isLoading={isLoading}>
          Save profile
        </Button>
      </form>
    </Card>
  );
}
