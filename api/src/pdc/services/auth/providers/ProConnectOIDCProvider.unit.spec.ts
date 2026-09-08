import { assertEquals } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { failsMfaCheck, failsSirenCheck, MFA_ACR_VALUES, mfaClaimsParameter } from "./ProConnectOIDCProvider.ts";

describe("ProConnectOIDCProvider.failsSirenCheck", () => {
  it("fails closed when login_siren is null and user is not registry.admin", () => {
    assertEquals(failsSirenCheck({ siren: "123456789" }, { login_siren: null, role: "territory.admin" }), true);
  });

  it("fails closed when login_siren is empty and user is not registry.admin", () => {
    assertEquals(failsSirenCheck({ siren: "123456789" }, { login_siren: "", role: "territory.admin" }), true);
  });

  it("passes for registry.admin regardless of siren", () => {
    assertEquals(failsSirenCheck({ siren: "999999999" }, { login_siren: null, role: "registry.admin" }), false);
  });

  it("passes when proconnect siren matches login_siren", () => {
    assertEquals(failsSirenCheck({ siren: "123456789" }, { login_siren: "123456789", role: "territory.admin" }), false);
  });

  it("fails when proconnect siren differs from login_siren", () => {
    assertEquals(failsSirenCheck({ siren: "123456789" }, { login_siren: "987654321", role: "territory.admin" }), true);
  });
});

describe("ProConnectOIDCProvider MFA", () => {
  it("builds the claims parameter requesting an essential MFA acr", () => {
    assertEquals(
      mfaClaimsParameter(["eidas1-mfa", "eidas2"]),
      '{"id_token":{"acr":{"essential":true,"values":["eidas1-mfa","eidas2"]}}}',
    );
  });

  it("accepts an acr listed in the MFA values", () => {
    assertEquals(failsMfaCheck("eidas1-mfa", MFA_ACR_VALUES), false);
  });

  it("rejects an acr without MFA", () => {
    assertEquals(failsMfaCheck("eidas1", MFA_ACR_VALUES), true);
  });

  it("fails closed when the acr claim is missing", () => {
    assertEquals(failsMfaCheck(undefined, MFA_ACR_VALUES), true);
  });

  it("fails closed when the acr claim is not a string", () => {
    assertEquals(failsMfaCheck(["eidas1-mfa"], MFA_ACR_VALUES), true);
  });

  it("covers every acr level documented as MFA-capable", () => {
    assertEquals(MFA_ACR_VALUES, ["eidas0-mfa", "eidas1-mfa", "eidas2", "eidas3"]);
  });
});
