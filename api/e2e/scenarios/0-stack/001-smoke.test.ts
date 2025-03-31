import { expect } from "dep:expect";
import { beforeEach, describe, it } from "dep:testing-bdd";
import { API } from "../../lib/API.ts";
import { env } from "../../lib/config.ts";

const USER_ACCESSKEY = env("APIE2E_AUTH_ACCESSKEY");
const USER_SECRETKEY = env("APIE2E_AUTH_SECRETKEY");

describe("Unauthenticated smoke test", () => {
  const http = new API();

  it("should be up and running", async () => {
    const response = await http.get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("should return 401 for unauthenticated user", async () => {
    const response = await http.get("/auth/me");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Utilisateur non authentifié" });
  });
});

describe("Authenticated smoke test", () => {
  const http = new API();

  beforeEach(async () => {
    await http.authenticate(USER_ACCESSKEY, USER_SECRETKEY);
  });

  it("should be up and running", async () => {
    const response = await http.get("/auth/me");
    expect(response.status).toBe(200);

    // informations must match the ones in the dex config-e2e.yaml file
    expect(response.body).toEqual({
      operator_id: 1,
      role: "application",
      email: "admin@example.com",
    });
  });
});
