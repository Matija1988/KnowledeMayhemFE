import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { GameBoard } from "./GameBoard";

describe("GameBoard", () => {
  it("renders authoritative dimensions, tile coordinates, and active pieces", () => {
    render(<GameBoard session={gameSessionFixture()} currentUserId="user-1" />);

    const board = screen.getByRole("grid", { name: /game board/i });
    expect(board).toHaveStyle({ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" });
    expect(screen.getAllByRole("gridcell")).toHaveLength(6);
    expect(screen.getByRole("gridcell", { name: /row 1 column 1/i })).toBeInTheDocument();
    expect(within(screen.getByRole("gridcell", { name: /row 1 column 1/i })).getByText("P1")).toBeInTheDocument();
  });

  it("does not render captured pieces on tiles", () => {
    const session = gameSessionFixture({
      pieces: [{ ...gameSessionFixture().pieces[0], isCaptured: true }, gameSessionFixture().pieces[1]],
    });

    render(<GameBoard session={session} currentUserId="user-1" />);

    expect(screen.queryByText("P1")).not.toBeInTheDocument();
  });

  it("keeps the rendered board shape stable when parent state rerenders with the same session", () => {
    const session = gameSessionFixture();
    const { rerender } = render(<GameBoard session={session} currentUserId="user-1" />);

    rerender(<GameBoard session={session} currentUserId="user-1" />);

    expect(screen.getAllByRole("gridcell")).toHaveLength(session.boardWidth * session.boardHeight);
    expect(screen.getAllByLabelText(/piece level 1/i)).toHaveLength(session.pieces.filter((piece) => !piece.isCaptured).length);
  });

  it("selects pieces and activates valid targets by click and keyboard", async () => {
    const user = userEvent.setup();
    const onPieceSelect = vi.fn();
    const onTargetSelect = vi.fn();

    render(
      <GameBoard
        session={gameSessionFixture()}
        currentUserId="user-1"
        selectedPieceId="piece-1"
        candidateTargets={[{ x: 1, y: 0 }]}
        onPieceSelect={onPieceSelect}
        onTargetSelect={onTargetSelect}
      />,
    );

    await user.click(screen.getByRole("gridcell", { name: /row 1 column 1/i }));
    expect(onPieceSelect).toHaveBeenCalledWith("piece-1");

    const target = screen.getByRole("gridcell", { name: /row 1 column 2/i });
    target.focus();
    await user.keyboard("{Enter}");
    expect(onTargetSelect).toHaveBeenCalledWith({ x: 1, y: 0 });
  });

  it("does not submit invalid targets", async () => {
    const user = userEvent.setup();
    const onTargetSelect = vi.fn();

    render(
      <GameBoard
        session={gameSessionFixture()}
        currentUserId="user-1"
        selectedPieceId="piece-1"
        candidateTargets={[{ x: 1, y: 0 }]}
        onTargetSelect={onTargetSelect}
      />,
    );

    await user.click(screen.getByRole("gridcell", { name: /row 2 column 2/i }));

    expect(onTargetSelect).not.toHaveBeenCalled();
  });

  it("blocks board activation while conquest interaction is pending", async () => {
    const user = userEvent.setup();
    const onPieceSelect = vi.fn();
    const onTargetSelect = vi.fn();

    render(
      <GameBoard
        session={gameSessionFixture()}
        currentUserId="user-1"
        selectedPieceId="piece-1"
        candidateTargets={[{ x: 1, y: 0 }]}
        disabled
        onPieceSelect={onPieceSelect}
        onTargetSelect={onTargetSelect}
      />,
    );

    await user.click(screen.getByRole("gridcell", { name: /row 1 column 2/i }));

    expect(onPieceSelect).not.toHaveBeenCalled();
    expect(onTargetSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("gridcell", { name: /row 1 column 2/i })).toHaveAttribute("aria-disabled", "true");
  });
});
