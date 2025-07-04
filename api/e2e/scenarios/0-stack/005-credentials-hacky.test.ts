import { ForbiddenException, NotFoundException } from "@/ilos/common/index.ts";
import { expect } from "dep:expect";
import { describe, it } from "dep:testing-bdd";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  OPERATOR_EMAIL,
  OPERATOR_PASSWORD,
  TERRITORY_EMAIL,
  TERRITORY_PASSWORD,
} from "../../config.ts";
import { API } from "../../lib/API.ts";
import { regex_jwt } from "../../lib/regex.ts";

/**
 * Based on registered user email/password in auth.users table
 * Make sure creating credentials works for the operator.
 *
 * Credentials = access_key + secret_key
 */
describe("Credentials Creation", () => {
  it("should fail to create credentials for another operator", async () => {
    const http = new API();
    await http.login<{ operator_id: number }>(OPERATOR_EMAIL, OPERATOR_PASSWORD);
    await expect(http.createCredentials(999)).rejects.toThrow(ForbiddenException);
  });

  it("should fail a territory trying to create credentials", async () => {
    const http = new API();
    await http.login<{ operator_id: number }>(TERRITORY_EMAIL, TERRITORY_PASSWORD);
    await expect(http.createCredentials(1)).rejects.toThrow(ForbiddenException);
  });

  it("should fail a super admin creating for a missing operator", async () => {
    const http = new API();
    await http.login<{ operator_id: number }>(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(http.createCredentials(2)).rejects.toThrow(NotFoundException);
  });

  it("should succeed to create credentials as a super admin", async () => {
    const operator_id = 1;
    const http = new API();
    await http.login<{ operator_id: number }>(ADMIN_EMAIL, ADMIN_PASSWORD);
    const credentials = await http.createCredentials(operator_id);
    expect(credentials).toMatchObject({
      access_key: expect.any(String),
      secret_key: expect.any(String),
    });

    // Verify that the credentials can be used to authenticate
    await http.authenticate(credentials.access_key, credentials.secret_key);
    expect(http.token).toBeDefined();
    expect(http.token).toMatch(regex_jwt);
    http.clearAccessToken();

    // Read credentials
    const readCredentials = await http.readCredentials(operator_id);
    expect(readCredentials).toBeDefined();
    expect(readCredentials.length).toBeGreaterThan(0);
    expect(readCredentials[0]).toMatchObject({
      operator_id: operator_id,
      role: "operator.application",
      token_id: expect.any(String),
    });
  });

  it("should fail on empty body", async () => {
    const http = new API();
    await http.login<{ operator_id: number }>(OPERATOR_EMAIL, OPERATOR_PASSWORD);

    // @ts-expect-error type error to simulate empty body
    await expect(http.createCredentials(undefined)).rejects.toThrow(ForbiddenException);
  });

  it("should fail on wrong payload", async () => {
    const http = new API();
    await http.login<{ operator_id: number }>(OPERATOR_EMAIL, OPERATOR_PASSWORD);

    // @ts-expect-error type error to simulate wrong payload
    await expect(http.createCredentials("wrong")).rejects.toThrow(ForbiddenException);
  });
});
