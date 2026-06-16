import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { identityHandlers } from "./handlers/identityHandlers";
import { lobbyHandlers } from "./handlers/lobbyHandlers";
import { resetAuthStoreForTests } from "../stores/authStore";
import { resetErrorStoreForTests } from "../stores/errorStore";
import { resetLoadingStoreForTests } from "../stores/loadingStore";
import { resetLobbyStoreForTests } from "../stores/lobbyStore";

export const server = setupServer(...identityHandlers, ...lobbyHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  server.resetHandlers();
  resetAuthStoreForTests();
  resetErrorStoreForTests();
  resetLoadingStoreForTests();
  resetLobbyStoreForTests();
});

afterAll(() => server.close());
