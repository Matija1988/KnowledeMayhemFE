import { CreateLobbyCard } from "./CreateLobbyCard";
import { JoinLobbyCard } from "./JoinLobbyCard";
import { LogoutButton } from "../auth/LogoutButton";

export function LobbyLandingPage() {
  return (
    <main className="lobby-page">
      <header className="lobby-header">
        <h1>Lobby</h1>
        <LogoutButton />
      </header>
      <div className="lobby-grid">
        <CreateLobbyCard />
        <JoinLobbyCard />
      </div>
    </main>
  );
}
