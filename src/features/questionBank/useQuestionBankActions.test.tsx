import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { adminToken } from "../../tests/fixtures/questionBankFixtures";
import { useAuthStore } from "../../stores/authStore";
import { useQuestionBankStore } from "../../stores/questionBankStore";
import { useQuestionBankActions } from "./useQuestionBankActions";

describe("useQuestionBankActions", () => {
  it("loads, saves, and records conflict state through shared stores", async () => {
    useAuthStore.getState().login(adminToken);
    const { result } = renderHook(() => useQuestionBankActions());

    await act(async () => {
      await result.current.loadCategories();
    });
    expect(useQuestionBankStore.getState().categories).toHaveLength(2);

    await act(async () => {
      await result.current.saveCategory({ name: "Conflict", description: "Conflict" });
    });
    expect(useQuestionBankStore.getState().conflictMessage).toContain("Another staff user");
  });
});
