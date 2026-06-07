import { describe, expect, it } from "vitest";
import { act } from "@testing-library/react";
import { createAuthError } from "../domain/auth";
import { resetErrorStoreForTests, useErrorStore } from "./errorStore";

describe("errorStore", () => {
  it("routes toast and modal errors to their display modes", () => {
    resetErrorStoreForTests();

    act(() => useErrorStore.getState().showError(createAuthError("Toast message")));
    expect(useErrorStore.getState().toast?.message).toBe("Toast message");

    act(() => useErrorStore.getState().showError(createAuthError("Modal message", "modal")));
    expect(useErrorStore.getState().modal?.message).toBe("Modal message");
  });
});
