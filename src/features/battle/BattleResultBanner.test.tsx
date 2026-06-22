import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { battleResultFixture } from "../../tests/fixtures/battleFixtures";
import { BattleResultBanner } from "./BattleResultBanner";

describe("BattleResultBanner", () => {
  it("shows capture and level-up result details without answer correctness metadata", () => {
    render(<BattleResultBanner result={battleResultFixture({ reason: "completed", capturedPieceId: "piece-2", newLevel: 3 })} />);

    expect(screen.getByRole("status")).toHaveTextContent(/battle succeeded/i);
    expect(screen.getByText(/captured piece: piece-2/i)).toBeInTheDocument();
    expect(screen.getByText(/piece level: 3/i)).toBeInTheDocument();
    expect(screen.queryByText(/correct answer/i)).not.toBeInTheDocument();
  });

  it("shows special field failed, expired, cancelled, and max-level-neutral feedback", () => {
    const { rerender } = render(
      <BattleResultBanner result={battleResultFixture({ attemptKind: "SpecialField", status: "Failed", reason: "incorrect-answer", capturedPieceId: null, newLevel: null })} />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(/special field failed/i);
    expect(screen.getByText(/incorrect-answer/i)).toBeInTheDocument();

    rerender(<BattleResultBanner result={battleResultFixture({ status: "Expired", reason: "expired", capturedPieceId: null, newLevel: null })} />);
    expect(screen.getByRole("status")).toHaveTextContent(/battle expired/i);

    rerender(<BattleResultBanner result={battleResultFixture({ status: "Cancelled", reason: "cancelled", capturedPieceId: null, newLevel: null })} />);
    expect(screen.getByRole("status")).toHaveTextContent(/battle cancelled/i);
  });
});
