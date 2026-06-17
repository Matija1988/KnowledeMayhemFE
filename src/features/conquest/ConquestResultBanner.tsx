import type { ConquestResult } from "../../domain/conquest/conquestTypes";

type ConquestResultBannerProps = {
  result: ConquestResult;
};

export function ConquestResultBanner({ result }: ConquestResultBannerProps) {
  const isSuccess = result.resultStatus === "Succeeded" || result.isCorrect;
  const label =
    result.resultStatus === "Expired"
      ? "Expired"
      : result.resultStatus === "Cancelled"
        ? "Cancelled"
        : isSuccess
          ? "Correct"
          : "Incorrect";
  const message =
    result.resultStatus === "Expired"
      ? "Time ran out. The conquest failed and the turn advanced."
      : result.resultStatus === "Cancelled"
        ? "The conquest attempt was cancelled."
        : isSuccess
          ? "The tile was conquered and the turn advanced."
          : "The piece stayed in place and the turn advanced.";

  return (
    <section
      className={`conquest-result conquest-result--${isSuccess ? "success" : result.resultStatus.toLowerCase()}`}
      role="status"
      aria-live="polite"
    >
      <strong>{label}</strong>
      <p>{message}</p>
    </section>
  );
}

