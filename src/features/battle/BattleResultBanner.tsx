import type { BattleResult } from "../../domain/battle/battleTypes";

type BattleResultBannerProps = {
  result: BattleResult;
};

export function BattleResultBanner({ result }: BattleResultBannerProps) {
  const className = `conquest-result conquest-result--${result.status.toLowerCase()}`;
  const label = result.attemptKind === "Battle" ? "Battle" : "Special field";
  const outcome =
    result.status === "Succeeded"
      ? `${label} succeeded.`
      : result.status === "Expired"
        ? `${label} expired.`
        : result.status === "Cancelled"
          ? `${label} cancelled.`
          : `${label} failed.`;

  return (
    <div className={className} role="status">
      <p>{outcome}</p>
      {result.capturedPieceId ? <p>Captured piece: {result.capturedPieceId}</p> : null}
      {result.newLevel ? <p>Piece level: {result.newLevel}</p> : null}
      {result.reason ? <p>{result.reason}</p> : null}
    </div>
  );
}
