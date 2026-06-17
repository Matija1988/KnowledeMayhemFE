import { useEffect, useMemo, useRef, useState } from "react";

type QuestionTimerProps = {
  expiresAtUtc: string | null;
  disabled?: boolean;
  onExpired: () => void;
};

export function QuestionTimer({ expiresAtUtc, disabled = false, onExpired }: QuestionTimerProps) {
  const expiresAt = useMemo(() => (expiresAtUtc ? new Date(expiresAtUtc).getTime() : null), [expiresAtUtc]);
  const [remainingMs, setRemainingMs] = useState(() => (expiresAt ? Math.max(0, expiresAt - Date.now()) : null));
  const firedRef = useRef(false);

  useEffect(() => {
    if (!expiresAt || disabled) {
      return;
    }
    const update = () => {
      const next = Math.max(0, expiresAt - Date.now());
      setRemainingMs(next);
      if (next <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpired();
      }
    };
    update();
    const intervalId = window.setInterval(update, 1000);
    return () => window.clearInterval(intervalId);
  }, [disabled, expiresAt, onExpired]);

  if (!expiresAt || remainingMs === null) {
    return null;
  }

  const seconds = Math.ceil(remainingMs / 1000);
  return (
    <p className={`conquest-timer${seconds <= 10 ? " conquest-timer--warning" : ""}`} aria-live="off">
      Time remaining: {seconds}s
    </p>
  );
}
