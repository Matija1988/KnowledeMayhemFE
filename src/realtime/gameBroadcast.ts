import type { BattleResult } from "../domain/battle/battleTypes";

const channelName = "knowledge-mayhem.game-session";

export type GameBroadcastMessage = {
  type: "battle-result";
  result: BattleResult;
};

export function publishBattleResult(result: BattleResult): void {
  if (typeof BroadcastChannel === "undefined") {
    return;
  }
  const channel = new BroadcastChannel(channelName);
  channel.postMessage({ type: "battle-result", result } satisfies GameBroadcastMessage);
  channel.close();
}

export function subscribeToGameBroadcast(callback: (message: GameBroadcastMessage) => void): () => void {
  if (typeof BroadcastChannel === "undefined") {
    return () => undefined;
  }
  const channel = new BroadcastChannel(channelName);
  channel.onmessage = (event: MessageEvent<GameBroadcastMessage>) => callback(event.data);
  return () => channel.close();
}

