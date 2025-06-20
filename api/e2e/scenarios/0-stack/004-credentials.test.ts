import { expect } from "dep:expect";
import { describe, it } from "dep:testing-bdd";
import { API } from "../../lib/API.ts";

/**
 * Based on registered user email/password in auth.users table
 * Make sure creating credentials works for the operator.
 *
 * Credentials = access_key + secret_key
 */
describe("Credentials Authentication", () => {
  const OPERATOR_EMAIL = "operator@example.com";
  const OPERATOR_PASSWORD = "admin1234";
  const http = new API();

  it("should authenticate an operator", async () => {
    const operator = await http.login(OPERATOR_EMAIL, OPERATOR_PASSWORD);

    expect(operator).toMatchObject({
      operator_id: 1,
      role: "operator.admin",
      email: OPERATOR_EMAIL,
    });
  });

  // WIP
  it("should create credentials", async () => {
    const operator = await http.login<{ operator_id: number }>(OPERATOR_EMAIL, OPERATOR_PASSWORD);
    const credentials = await http.createCredentials(operator.operator_id, "application");
    console.log("Created credentials:", credentials);

    expect(credentials).toMatchObject({
      access_key: expect.any(String),
      secret_key: expect.any(String),
      role: "application",
      operator_id: operator.operator_id,
    });

    // // Verify that the credentials can be used to authenticate
    // const authResponse = await http.authenticate(credentials.access_key, credentials.secret_key);
    // expect(authResponse).toMatchObject({
    //   operator_id: operator.operator_id,
    //   role: "application",
    // });
  });
});
