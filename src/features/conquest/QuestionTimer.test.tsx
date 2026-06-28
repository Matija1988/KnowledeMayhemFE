import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionTimer } from "./QuestionTimer";

describe("QuestionTimer", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows countdown and fires expiration once", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-17T10:00:00.000Z"));
    const onExpired = vi.fn();

    render(<QuestionTimer expiresAtUtc="2026-06-17T10:00:02.000Z" onExpired={onExpired} />);

    expect(screen.getByText(/time remaining: 2s/i)).toBeInTheDocument();
    vi.advanceTimersByTime(2500);
    expect(onExpired).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2500);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it("does not expire while an answer submission is in flight", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-17T10:00:00.000Z"));
    const onExpired = vi.fn();

    render(<QuestionTimer expiresAtUtc="2026-06-17T10:00:01.000Z" disabled onExpired={onExpired} />);

    vi.advanceTimersByTime(5000);
    expect(onExpired).not.toHaveBeenCalled();
  });
});

