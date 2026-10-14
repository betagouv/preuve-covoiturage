import { assertEquals } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { formatTaggedLine } from "./tagged.ts";

describe("formatTaggedLine", () => {
  it("écrit préfixe, étape puis clé=valeur, sans les valeurs absentes", () => {
    assertEquals(
      formatTaggedLine("[http]", "error", { status: 401, error: "UnauthorizedException", path: undefined }),
      "[http] error status=401 error=UnauthorizedException",
    );
  });

  it("neutralise espaces, retours à la ligne et = dans les valeurs", () => {
    assertEquals(formatTaggedLine("[x]", "y", { error: "a b\nfake=1" }), "[x] y error=a_b_fake_1");
  });

  it("coupe les valeurs à 64 caractères", () => {
    assertEquals(formatTaggedLine("[x]", "y", { error: "a".repeat(100) }), `[x] y error=${"a".repeat(64)}`);
  });

  it("refuse @ sauf demande explicite", () => {
    assertEquals(formatTaggedLine("[x]", "y", { email: "j***@idfm.fr" }), "[x] y email=j***_idfm.fr");
    assertEquals(
      formatTaggedLine("[x]", "y", { email: "j***@idfm.fr" }, { allowAt: true }),
      "[x] y email=j***@idfm.fr",
    );
  });
});
