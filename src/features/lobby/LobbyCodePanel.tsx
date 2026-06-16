import { useState } from "react";
import { Button } from "../../components/ui/Button";

type LobbyCodePanelProps = {
  code: string;
};

export function LobbyCodePanel({ code }: LobbyCodePanelProps) {
  const [message, setMessage] = useState("");

  async function copyCode() {
    try {
      await navigator.clipboard?.writeText(code);
      setMessage("Lobby code copied.");
    } catch {
      setMessage("Unable to copy lobby code.");
    }
  }

  return (
    <section className="lobby-code-panel" aria-labelledby="lobby-code-title">
      <h2 id="lobby-code-title">Lobby code</h2>
      <p className="lobby-code">{code}</p>
      <Button type="button" variant="secondary" onClick={() => void copyCode()} aria-label="Copy lobby code">
        Copy
      </Button>
      {message ? (
        <p role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
    </section>
  );
}
