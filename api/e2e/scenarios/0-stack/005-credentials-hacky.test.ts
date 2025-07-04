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
describe("Credentials Authentication", () => {
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

  // it("should create, read and delete credentials", async () => {
  //   const http = new API();
  //   const operator = await http.login<{ operator_id: number }>(OPERATOR_EMAIL, OPERATOR_PASSWORD);
  //   const credentials = await http.createCredentials(operator.operator_id);
  //   expect(credentials).toMatchObject({
  //     access_key: expect.any(String),
  //     secret_key: expect.any(String),
  //   });

  //   // Read credentials
  //   const list = await http.readCredentials(operator.operator_id);
  //   expect(list).toBeDefined();
  //   expect(list.length).toBeGreaterThan(0);
  //   expect(list[0]).toMatchObject({
  //     token_id: expect.any(String),
  //     operator_id: operator.operator_id,
  //     role: "operator.application",
  //   });

  //   // Delete credentials
  //   const { operator_id, token_id } = list[0];
  //   await http.deleteCredentials(operator_id, token_id!);

  //   // Verify deletion
  //   const updatedCredentials = await http.readCredentials(operator.operator_id);
  //   expect(updatedCredentials.filter((i) => i.token_id === token_id).length).toBe(0);
  // });
});
