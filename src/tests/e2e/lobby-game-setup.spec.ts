import { expect, test } from "@playwright/test";
import {
  dispatchLobbySetupChanged,
  guestToken,
  hostToken,
  installLobbyHubMock,
  lobbyWithGuest,
  routeLobbySetupApi,
  signIn,
  type LobbySetupE2EState,
  type LobbySetupLobbyDto,
} from "./lobby-fixtures";

test("two lobby clients see setup changes within 2 seconds without refresh", async ({ browser }) => {
  const state: LobbySetupE2EState = { current: cloneLobby(lobbyWithGuest) };
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();

  await installLobbyHubMock(host);
  await installLobbyHubMock(guest);
  await signIn(host, hostToken);
  await signIn(guest, guestToken);
  await routeLobbySetupApi(host, state, "user-1");
  await routeLobbySetupApi(guest, state, "user-2");

  await Promise.all([host.goto("/lobby/lobby-1"), guest.goto("/lobby/lobby-1")]);
  await expect(host.getByLabel("C#")).toBeVisible();
  await expect(guest.getByText("Selected: None")).toBeVisible();

  await host.getByLabel("C#").check();
  await host.getByRole("button", { name: "Save categories" }).click();
  await dispatchLobbySetupChanged(guest, state.current, "CategoriesUpdated");
  await expect(guest.getByText("Selected: C#")).toBeVisible({ timeout: 2000 });

  await host.getByRole("button", { name: "Red Available" }).click();
  await dispatchLobbySetupChanged(guest, state.current, "PlayerColorSelected");
  await expect(guest.getByText("Red - Not ready")).toBeVisible({ timeout: 2000 });

  await guest.getByRole("button", { name: "Blue Available" }).click();
  await dispatchLobbySetupChanged(host, state.current, "PlayerColorSelected");
  await expect(host.getByText("Blue - Not ready")).toBeVisible({ timeout: 2000 });

  await host.getByRole("button", { name: "Ready" }).click();
  await dispatchLobbySetupChanged(guest, state.current, "PlayerReadyChanged");
  await expect(guest.getByText("Red - Ready")).toBeVisible({ timeout: 2000 });

  await guest.getByRole("button", { name: "Ready" }).click();
  await dispatchLobbySetupChanged(host, state.current, "PlayerReadyChanged");
  await expect(host.getByText("Blue - Ready")).toBeVisible({ timeout: 2000 });
  await expect(host.getByRole("button", { name: "Start lobby" })).toBeEnabled();

  await hostContext.close();
  await guestContext.close();
});

function cloneLobby(lobby: LobbySetupLobbyDto): LobbySetupLobbyDto {
  return JSON.parse(JSON.stringify(lobby)) as LobbySetupLobbyDto;
}
