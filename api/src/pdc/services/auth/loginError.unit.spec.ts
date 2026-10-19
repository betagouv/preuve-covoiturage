import { assertEquals } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { loginErrorCode } from "./loginError.ts";
import { MfaRequiredError } from "./providers/ProConnectOIDCProvider.ts";

describe("loginErrorCode", () => {
  it("renvoie mfa_required pour un refus MFA", () => {
    assertEquals(loginErrorCode(new MfaRequiredError("x", "eidas1")), "mfa_required");
  });

  it("reconnaît un refus MFA par son nom si le module est résolu deux fois", () => {
    const e = new Error("x");
    e.name = "MfaRequiredError";
    assertEquals(loginErrorCode(e), "mfa_required");
  });

  it("renvoie login_failed pour toute autre erreur", () => {
    assertEquals(loginErrorCode(new Error("state mismatch")), "login_failed");
    assertEquals(loginErrorCode("boom"), "login_failed");
    assertEquals(loginErrorCode(undefined), "login_failed");
  });
});
