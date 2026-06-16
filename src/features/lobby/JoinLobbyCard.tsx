import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";
import { useLoadingStore } from "../../stores/loadingStore";
import { useLobbyActions } from "./useLobbyActions";

export function JoinLobbyCard() {
  const [code, setCode] = useState("");
  const { join, joinCodeError } = useLobbyActions();
  const isLoading = useLoadingStore((state) => state.isLoading && state.operation === "joinLobby");

  return (
    <Card aria-labelledby="join-lobby-title">
      <h2 id="join-lobby-title">Join lobby</h2>
      <form
        className="lobby-form"
        onSubmit={(event) => {
          event.preventDefault();
          void join(code);
        }}
      >
        <FormField id="lobbyCode" label="Lobby code" error={joinCodeError ?? undefined}>
          <Input
            id="lobbyCode"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            aria-describedby={joinCodeError ? "lobbyCode-error" : undefined}
          />
        </FormField>
        <Button type="submit" isLoading={isLoading}>
          Join lobby
        </Button>
      </form>
    </Card>
  );
}
