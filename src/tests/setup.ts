import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { identityHandlers } from "./handlers/identityHandlers";
import { resetAuthStoreForTests } from "../stores/authStore";
import { resetErrorStoreForTests } from "../stores/errorStore";
import { resetLoadingStoreForTests } from "../stores/loadingStore";

export const server = setupServer(...identityHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  server.resetHandlers();
  resetAuthStoreForTests();
  resetErrorStoreForTests();
  resetLoadingStoreForTests();
});

afterAll(() => server.close());
