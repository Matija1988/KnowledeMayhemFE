import { http, HttpResponse } from "msw";
import { authProblem, loginResponse } from "../fixtures/authFixtures";

export const identityHandlers = [
  http.post("**/api/identity/login", async ({ request }) => {
    const body = (await request.json()) as { usernameOrEmail?: string; password?: string };

    if (!body.usernameOrEmail || !body.password) {
      return HttpResponse.json(
        { title: "Missing required fields", detail: "Username/email and password are required.", status: 400 },
        { status: 400 },
      );
    }

    if (body.password === "wrong-password") {
      return HttpResponse.json(authProblem, { status: 401 });
    }

    return HttpResponse.json(loginResponse);
  }),
];
