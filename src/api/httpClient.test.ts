import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../tests/setup";
import { authenticatedRequestJson } from "./httpClient";

describe("httpClient", () => {
  it("sends authenticated JSON requests with bearer headers and omitted credentials", async () => {
    server.use(
      http.post("**/api/probe", async ({ request }) =>
        HttpResponse.json({
          authorization: request.headers.get("authorization"),
          accept: request.headers.get("accept"),
          contentType: request.headers.get("content-type"),
          body: await request.json(),
        }),
      ),
    );

    await expect(
      authenticatedRequestJson("https://api.example.test/api/probe", {
        method: "POST",
        accessToken: "token-1",
        body: { ok: true },
      }),
    ).resolves.toEqual({
      authorization: "Bearer token-1",
      accept: "application/json",
      contentType: "application/json",
      body: { ok: true },
    });
  });
});
