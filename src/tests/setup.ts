import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { identityHandlers } from "./handlers/identityHandlers";
import { lobbyHandlers } from "./handlers/lobbyHandlers";
import { gameHandlers } from "./handlers/gameHandlers";
import { conquestHandlers } from "./handlers/conquestHandlers";
import { questionBankHandlers } from "./handlers/questionBankHandlers";
import { resetAuthStoreForTests } from "../stores/authStore";
import { resetErrorStoreForTests } from "../stores/errorStore";
import { resetGameStoreForTests } from "../stores/gameStore";
import { resetConquestStoreForTests } from "../stores/conquestStore";
import { resetLoadingStoreForTests } from "../stores/loadingStore";
import { resetLobbyStoreForTests } from "../stores/lobbyStore";
import { resetQuestionBankStoreForTests } from "../stores/questionBankStore";

export const server = setupServer(
  ...identityHandlers,
  ...lobbyHandlers,
  ...gameHandlers,
  ...conquestHandlers,
  ...questionBankHandlers,
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  server.resetHandlers();
  resetAuthStoreForTests();
  resetErrorStoreForTests();
  resetGameStoreForTests();
  resetConquestStoreForTests();
  resetLoadingStoreForTests();
  resetLobbyStoreForTests();
  resetQuestionBankStoreForTests();
});

afterAll(() => server.close());
