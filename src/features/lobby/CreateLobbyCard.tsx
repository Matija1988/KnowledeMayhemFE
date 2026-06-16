import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { useLoadingStore } from "../../stores/loadingStore";
import { useLobbyActions } from "./useLobbyActions";

export function CreateLobbyCard() {
  const [maxPlayers, setMaxPlayers] = useState(4);
  const { create } = useLobbyActions();
  const isLoading = useLoadingStore((state) => state.isLoading && state.operation === "createLobby");

  return (
    <Card aria-labelledby="create-lobby-title">
      <h2 id="create-lobby-title">Create lobby</h2>
      <form
        className="lobby-form"
        onSubmit={(event) => {
          event.preventDefault();
          void create(maxPlayers);
        }}
      >
        <FormField id="maxPlayers" label="Max players">
          <select
            id="maxPlayers"
            value={maxPlayers}
            onChange={(event) => setMaxPlayers(Number(event.target.value))}
            className="ui-input"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </FormField>
        <Button type="submit" isLoading={isLoading}>
          Create lobby
        </Button>
      </form>
    </Card>
  );
}
