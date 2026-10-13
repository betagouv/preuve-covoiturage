import { assertEquals, assertMatch } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { errorCode, formatProconnectLine, maskEmail, maskSiren, newAttemptId } from "./proconnectLog.ts";

describe("proconnectLog.maskEmail", () => {
  it("garde la première lettre et le domaine", () => {
    assertEquals(maskEmail("jean.dupont@idfm.fr"), "j***@idfm.fr");
  });

  it("masque entièrement une valeur sans @", () => {
    assertEquals(maskEmail("jean.dupont"), "***");
  });

  it("masque entièrement une partie locale vide", () => {
    assertEquals(maskEmail("@idfm.fr"), "***");
  });

  it("masque une valeur absente", () => {
    assertEquals(maskEmail(undefined), "***");
    assertEquals(maskEmail(null), "***");
  });
});

describe("proconnectLog.maskSiren", () => {
  it("garde les 3 premiers et 2 derniers chiffres", () => {
    assertEquals(maskSiren("123456789"), "123****89");
  });

  it("réduit un SIRET à son SIREN masqué", () => {
    assertEquals(maskSiren("12345678900012"), "123****89");
  });

  it("masque entièrement une valeur trop courte", () => {
    assertEquals(maskSiren("1234"), "***");
  });

  it("masque une valeur absente", () => {
    assertEquals(maskSiren(undefined), "***");
    assertEquals(maskSiren(null), "***");
  });
});

describe("proconnectLog.newAttemptId", () => {
  it("produit 8 caractères hexadécimaux", () => {
    assertMatch(newAttemptId(), /^[0-9a-f]{8}$/);
  });

  it("varie d'un appel à l'autre", () => {
    assertEquals(newAttemptId() === newAttemptId(), false);
  });
});

describe("proconnectLog.formatProconnectLine", () => {
  it("préfixe l'étape et aligne les champs en clé=valeur", () => {
    assertEquals(
      formatProconnectLine("token ok", { attempt: "0a1b2c3d", acr: "eidas1", ms: 120 }),
      "[proconnect] token ok attempt=0a1b2c3d acr=eidas1 ms=120",
    );
  });

  it("omet les champs absents", () => {
    assertEquals(
      formatProconnectLine("login start", { attempt: "0a1b2c3d", error: undefined }),
      "[proconnect] login start attempt=0a1b2c3d",
    );
  });

  it("écrit les booléens", () => {
    assertEquals(
      formatProconnectLine("login start", { mfa_required: false }),
      "[proconnect] login start mfa_required=false",
    );
  });

  it("garde les valeurs masquées lisibles", () => {
    assertEquals(
      formatProconnectLine("user refused", { email: maskEmail("a@b.fr"), siren: maskSiren("123456789") }),
      "[proconnect] user refused email=a***@b.fr siren=123****89",
    );
  });

  // provider_error vient de la query string : contrôlé par l'appelant.
  it("neutralise espaces et retours à la ligne", () => {
    assertEquals(
      formatProconnectLine("callback received", { provider_error: "access_denied\nfake=1 x" }),
      "[proconnect] callback received provider_error=access_denied_fake_1_x",
    );
  });

  it("tronque les valeurs à 64 caractères", () => {
    assertEquals(formatProconnectLine("x", { error: "a".repeat(100) }), `[proconnect] x error=${"a".repeat(64)}`);
  });
});

describe("proconnectLog.errorCode", () => {
  it("renvoie le nom de l'erreur seul", () => {
    assertEquals(errorCode(new TypeError("https://x?email=a@b.fr")), "TypeError");
  });

  it("ajoute le code OIDC en priorité sur code", () => {
    const e = Object.assign(new Error("m"), { error: "invalid_grant", code: "OAUTH_X" });
    assertEquals(errorCode(e), "Error:invalid_grant");
  });

  it("utilise code à défaut de error", () => {
    assertEquals(errorCode(Object.assign(new Error("m"), { code: "OAUTH_X" })), "Error:OAUTH_X");
  });

  it("renvoie unknown pour un non-Error", () => {
    assertEquals(errorCode("boom"), "unknown");
  });
});
