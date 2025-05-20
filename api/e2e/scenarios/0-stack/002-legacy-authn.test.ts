import { expect } from "dep:expect";
import { beforeEach, describe, it } from "dep:testing-bdd";
import { API } from "../../lib/API.ts";
import { env } from "../../lib/config.ts";

const OPERATOR_EMAIL = env("APIE2E_AUTH_OPERATOR_EMAIL");
const OPERATOR_PASSWORD = env("APIE2E_AUTH_OPERATOR_PASSWORD");

describe("Legacy Authentication", () => {
  const http = new API();

  beforeEach(async () => {
    if (!http.token) await http.legacyAuthenticate(OPERATOR_EMAIL, OPERATOR_PASSWORD);
  });

  it("should POST a valid operator journey to API v3", async () => {
    const response = await http.get("/profile");
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toMatchObject({
      operator_id: 1,
      role: "application",
    });
  });
});
