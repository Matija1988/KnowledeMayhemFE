import { Link } from "react-router-dom";
import { getUserRoleFromJwt } from "../../domain/auth";
import { useAuthStore } from "../../stores/authStore";
import { LogoutButton } from "./LogoutButton";

type AccountMenuProps = {
  confirmActiveGame?: boolean;
  showRole?: boolean;
};

export function AccountMenu({ confirmActiveGame = false, showRole = true }: AccountMenuProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = getUserRoleFromJwt(accessToken);

  return (
    <div className="account-menu" aria-label="Account menu">
      {showRole ? <span className="account-menu__role">{role}</span> : null}
      <Link className="ui-button ui-button--secondary" to="/account/settings">
        Settings
      </Link>
      <LogoutButton confirmActiveGame={confirmActiveGame} />
    </div>
  );
}
