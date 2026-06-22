import { afterEach, describe, expect, it, vi } from "vitest";
import {
  recordGameTelemetry,
  recordGameTiming,
  sanitizeTelemetryDetails,
  setGameTelemetrySink,
  type GameTelemetryEvent,
} from "./gameTelemetry";

describe("gameTelemetry", () => {
  afterEach(() => {
    setGameTelemetrySink(null);
    window.__knowledgeMayhemGameTelemetry = [];
  });

  it("removes hidden correctness metadata before emitting diagnostics", () => {
    const sanitized = sanitizeTelemetryDetails({
      gameSessionId: "session-1",
      answerId: "answer-1",
      correctAnswerId: "answer-2",
      nested: {
        isCorrect: true,
        correctAnswerText: "Secret",
        reason: "rejected",
      },
    });

    expect(sanitized).toEqual({
      gameSessionId: "session-1",
      answerId: "answer-1",
      nested: { reason: "rejected" },
    });
  });

  it("records command failure events through the sink and browser event stream", () => {
    const sink = vi.fn();
    const listener = vi.fn((event: Event) => (event as CustomEvent<GameTelemetryEvent>).detail);
    setGameTelemetrySink(sink);
    window.addEventListener("knowledge-mayhem:game-telemetry", listener);

    const event = recordGameTelemetry("battle-command-failed", {
      gameSessionId: "session-1",
      attemptKind: "Battle",
      correctAnswerText: "Secret",
      message: "Rejected",
    });

    expect(event).toMatchObject({
      eventName: "battle-command-failed",
      details: { gameSessionId: "session-1", attemptKind: "Battle", message: "Rejected" },
    });
    expect(event.details).not.toHaveProperty("correctAnswerText");
    expect(sink).toHaveBeenCalledWith(event);
    expect(listener).toHaveBeenCalled();
    expect(window.__knowledgeMayhemGameTelemetry).toContain(event);

    window.removeEventListener("knowledge-mayhem:game-telemetry", listener);
  });

  it("records rounded duration markers for battle start and opponent update timings", () => {
    expect(recordGameTiming("battle-start", 100, { gameSessionId: "session-1" }, 350)).toMatchObject({
      eventName: "game-timing",
      details: { timingName: "battle-start", durationMs: 250, gameSessionId: "session-1" },
    });

    expect(recordGameTiming("opponent-update", 500, { gameSessionId: "session-1" }, 499)).toMatchObject({
      eventName: "game-timing",
      details: { timingName: "opponent-update", durationMs: 0, gameSessionId: "session-1" },
    });
  });
});

