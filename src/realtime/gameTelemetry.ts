export type GameTelemetryEventName =
  | "battle-command-failed"
  | "special-command-failed"
  | "game-hub-reconnecting"
  | "game-hub-reconnected"
  | "game-hub-disconnected"
  | "game-snapshot-required"
  | "game-realtime-payload-unmapped"
  | "game-realtime-payload-invalid"
  | "game-stale-event-rejected"
  | "game-timing";

export type GameTelemetryDetails = Record<string, unknown>;

export type GameTelemetryEvent = {
  eventName: GameTelemetryEventName;
  occurredAtUtc: string;
  details: GameTelemetryDetails;
};

type GameTelemetrySink = (event: GameTelemetryEvent) => void;

const telemetryEventType = "knowledge-mayhem:game-telemetry";
const forbiddenDetailKeys = new Set([
  "correctanswerid",
  "correctanswertext",
  "correctanswerids",
  "correctanswertexts",
  "correctness",
  "iscorrect",
  "hiddenmetadata",
]);

let telemetrySink: GameTelemetrySink | null = null;

declare global {
  interface Window {
    __knowledgeMayhemGameTelemetry?: GameTelemetryEvent[];
  }
}

export function setGameTelemetrySink(sink: GameTelemetrySink | null): void {
  telemetrySink = sink;
}

export function recordGameTelemetry(eventName: GameTelemetryEventName, details: GameTelemetryDetails = {}): GameTelemetryEvent {
  const event: GameTelemetryEvent = {
    eventName,
    occurredAtUtc: new Date().toISOString(),
    details: sanitizeTelemetryDetails(details),
  };

  telemetrySink?.(event);

  if (typeof window !== "undefined") {
    window.__knowledgeMayhemGameTelemetry = [...(window.__knowledgeMayhemGameTelemetry ?? []), event];
    window.dispatchEvent(new CustomEvent(telemetryEventType, { detail: event }));
  }

  return event;
}

export function recordGameTiming(
  name: "battle-start" | "opponent-update",
  startedAtMs: number,
  details: GameTelemetryDetails = {},
  endedAtMs = Date.now(),
): GameTelemetryEvent {
  return recordGameTelemetry("game-timing", {
    ...details,
    timingName: name,
    durationMs: Math.max(0, Math.round(endedAtMs - startedAtMs)),
  });
}

export function sanitizeTelemetryDetails(details: GameTelemetryDetails): GameTelemetryDetails {
  return sanitizeValue(details) as GameTelemetryDetails;
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !forbiddenDetailKeys.has(key.toLowerCase()))
      .map(([key, nestedValue]) => [key, sanitizeValue(nestedValue)]),
  );
}

