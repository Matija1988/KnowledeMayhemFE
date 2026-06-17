import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { conquestResultFixture } from "../../tests/fixtures/conquestFixtures";
import { ConquestResultBanner } from "./ConquestResultBanner";

describe("ConquestResultBanner", () => {
  it("announces success, failure, and expiration without color-only state", () => {
    const { rerender } = render(<ConquestResultBanner result={conquestResultFixture()} />);
    expect(screen.getByRole("status")).toHaveTextContent(/correct/i);
    expect(screen.getByText(/tile was conquered/i)).toBeInTheDocument();

    rerender(<ConquestResultBanner result={conquestResultFixture({ resultStatus: "Failed", isCorrect: false })} />);
    expect(screen.getByRole("status")).toHaveTextContent(/incorrect/i);

    rerender(<ConquestResultBanner result={conquestResultFixture({ resultStatus: "Expired", isCorrect: false })} />);
    expect(screen.getByRole("status")).toHaveTextContent(/expired/i);
  });
});

