import { CreateLobbyCard } from "./CreateLobbyCard";
import { JoinLobbyCard } from "./JoinLobbyCard";
import { AccountMenu } from "../auth/AccountMenu";

export function LobbyLandingPage() {
  return (
    <main className="lobby-page">
      <header className="lobby-header">
        <h1>Lobby</h1>
        <AccountMenu />
      </header>
      <div className="lobby-grid">
        <CreateLobbyCard />
        <JoinLobbyCard />
      </div>
    </main>
  );
}
