import { useLogout } from "./useLogout";

type LogoutButtonProps = {
  confirmActiveGame?: boolean;
};

export function LogoutButton({ confirmActiveGame = false }: LogoutButtonProps) {
  const { submit, isLoading } = useLogout();

  async function handleLogout() {
    if (
      confirmActiveGame &&
      !window.confirm("Logging out during an active game forfeits the game. Continue?")
    ) {
      return;
    }

    await submit();
  }

  return (
    <button className="ui-button ui-button--secondary" type="button" onClick={() => void handleLogout()} disabled={isLoading}>
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
