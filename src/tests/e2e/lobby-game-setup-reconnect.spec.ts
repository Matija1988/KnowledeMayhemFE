import { expect, test } from "@playwright/test";
import {
  finishLobbyReconnect,
  hostToken,
  installLobbyHubMock,
  lobbyWithGuest,
  routeLobbySetupApi,
  signIn,
  triggerLobbyReconnect,
  type LobbySetupE2EState,
  type LobbySetupLobbyDto,
} from "./lobby-fixtures";

test("reconnecting lobby client reconciles from the latest setup snapshot before controls are enabled", async ({ page }) => {
  const state: LobbySetupE2EState = { current: cloneLobby(lobbyWithGuest) };
  await installLobbyHubMock(page);
  await signIn(page, hostToken);
  await routeLobbySetupApi(page, state, "user-1");

  await page.goto("/lobby/lobby-1");
  await expect(page.getByLabel("C#")).toBeEnabled();

  await triggerLobbyReconnect(page);
  await expect(page.getByText("reconnecting")).toBeVisible();
  await expect(page.getByLabel("C#")).toBeDisabled();

  state.current = {
    ...state.current,
    selectedCategoryIds: ["cat-csharp"],
    setupVersion: state.current.setupVersion + 1,
    updatedAtUtc: new Date().toISOString(),
  };

  await finishLobbyReconnect(page);
  await expect(page.getByText("1 selected")).toBeVisible({ timeout: 2000 });
  await expect(page.getByLabel("C#")).toBeChecked();
  await expect(page.getByLabel("C#")).toBeEnabled();
});

function cloneLobby(lobby: LobbySetupLobbyDto): LobbySetupLobbyDto {
  return JSON.parse(JSON.stringify(lobby)) as LobbySetupLobbyDto;
}
