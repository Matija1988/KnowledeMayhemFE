import { Button } from "../../components/ui/Button";
import { allowedPieceColors, type Lobby, type PieceColor } from "../../domain/lobby/lobbyTypes";
import { selectCurrentLobbyPlayer, selectIsColorUsedByAnother } from "../../stores/lobbyStore";
import { useLobbyActions } from "./useLobbyActions";

type LobbyColorPickerProps = {
  lobby: Lobby;
  currentUserId: string | null;
  controlsDisabled?: boolean;
};

const colorHex: Record<PieceColor, string> = {
  Red: "#dc2626",
  Blue: "#2563eb",
  Green: "#16a34a",
  Yellow: "#ca8a04",
  Purple: "#9333ea",
  Orange: "#ea580c",
};

export function LobbyColorPicker({ lobby, currentUserId, controlsDisabled = false }: LobbyColorPickerProps) {
  const { selectColor } = useLobbyActions();
  const currentPlayer = selectCurrentLobbyPlayer(lobby, currentUserId);
  const isLocked = lobby.status !== "Open";

  return (
    <section className="lobby-setup-section" aria-labelledby="lobby-colors-title">
      <div className="lobby-setup-section__header">
        <h2 id="lobby-colors-title">Piece color</h2>
        <span>{currentPlayer?.selectedPieceColor ?? "None"}</span>
      </div>
      <div className="lobby-color-grid" role="list">
        {allowedPieceColors.map((color) => {
          const usedByAnother = selectIsColorUsedByAnother(lobby, currentUserId, color);
          const selected = currentPlayer?.selectedPieceColor === color;
          const stateLabel = selected ? "Selected" : usedByAnother ? "Taken" : "Available";
          return (
            <Button
              key={color}
              type="button"
              variant={selected ? "primary" : "secondary"}
              className="lobby-color-button"
              disabled={!currentPlayer || isLocked || usedByAnother || controlsDisabled}
              onClick={() => void selectColor(lobby.id, color)}
              aria-pressed={selected}
              aria-label={`${color} ${stateLabel}`}
              title={usedByAnother ? `${color} is already selected` : color}
            >
              <span className="lobby-color-swatch" style={{ backgroundColor: colorHex[color] }} aria-hidden="true" />
              <span>{color}</span>
              <span>{stateLabel}</span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
