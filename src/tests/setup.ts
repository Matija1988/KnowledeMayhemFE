import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { identityHandlers } from "./handlers/identityHandlers";
import { lobbyHandlers } from "./handlers/lobbyHandlers";
import { gameHandlers } from "./handlers/gameHandlers";
import { resetAuthStoreForTests } from "../stores/authStore";
import { resetErrorStoreForTests } from "../stores/errorStore";
import { resetGameStoreForTests } from "../stores/gameStore";
import { resetLoadingStoreForTests } from "../stores/loadingStore";
import { resetLobbyStoreForTests } from "../stores/lobbyStore";

export const server = setupServer(...identityHandlers, ...lobbyHandlers, ...gameHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  server.resetHandlers();
  resetAuthStoreForTests();
  resetErrorStoreForTests();
  resetGameStoreForTests();
  resetLoadingStoreForTests();
  resetLobbyStoreForTests();
});

afterAll(() => server.close());
