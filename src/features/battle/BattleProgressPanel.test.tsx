import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { battleQuestionFixture, specialFieldQuestionFixture } from "../../tests/fixtures/battleFixtures";
import { BattleProgressPanel } from "./BattleProgressPanel";

describe("BattleProgressPanel", () => {
  it("shows battle required answer progress and pending state", () => {
    render(<BattleProgressPanel question={battleQuestionFixture({ progress: { requiredCorrectAnswers: 3, correctAnswers: 1, status: "Pending" } })} expiredPending={false} />);

    expect(screen.getByRole("status")).toHaveTextContent("Progress: 1 / 3");
    expect(screen.getByText(/enemy battle/i)).toBeInTheDocument();
  });

  it("shows special field progress and expiration messaging", () => {
    render(<BattleProgressPanel question={specialFieldQuestionFixture()} expiredPending />);

    expect(screen.getByRole("status")).toHaveTextContent("Progress: 0 / 3");
    expect(screen.getByText(/question expired/i)).toBeInTheDocument();
  });
});
