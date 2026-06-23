import { Link } from "react-router-dom";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { AccountMenu } from "../auth/AccountMenu";
import { DangerZone } from "./DangerZone";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { ProfileSettingsForm } from "./ProfileSettingsForm";
import { useAccountSettings } from "./useAccountSettings";

export function AccountSettingsPage() {
  const {
    profile,
    status,
    saveIdentity,
    changePassword,
    deactivateAccount,
    isLoading,
    loadingOperation,
  } = useAccountSettings();

  const identityLoading = isLoading && loadingOperation === "updateAccountIdentity";
  const passwordLoading = isLoading && loadingOperation === "changePassword";
  const deactivationLoading = isLoading && loadingOperation === "deactivateAccount";

  return (
    <main className="account-settings-page">
      <header className="account-settings-header">
        <div>
          <h1>Account settings</h1>
          <p>Manage your profile, password, and account access.</p>
        </div>
        <div className="account-settings-actions">
          <Link className="ui-button ui-button--secondary" to="/lobby">
            Player area
          </Link>
          <AccountMenu />
        </div>
      </header>

      <section aria-live="polite" className="account-settings-status">
        {status.success ? <p className="account-settings-success">{status.success}</p> : null}
        {status.profile ? <p className="ui-field-error">{status.profile.message}</p> : null}
      </section>

      {!profile && isLoading ? <LoadingSpinner /> : null}
      {profile ? (
        <div className="account-settings-grid">
          <ProfileSettingsForm
            profile={profile}
            error={status.identity}
            isLoading={identityLoading}
            onSubmit={saveIdentity}
          />
          <PasswordChangeForm error={status.password} isLoading={passwordLoading} onSubmit={changePassword} />
          <DangerZone error={status.deactivation} isLoading={deactivationLoading} onSubmit={deactivateAccount} />
        </div>
      ) : null}
    </main>
  );
}
