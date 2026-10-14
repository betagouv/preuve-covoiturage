import { assertEquals, assertMatch, assertNotEquals } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { sessionRef } from "./sessionRef.ts";

describe("sessionRef", () => {
  const sid = "Zx8kQf2yTn3VbL0pWm4RsJ7dHc1GaE9u";

  it("donne une empreinte courte et stable", async () => {
    const ref = await sessionRef(sid);
    assertMatch(ref!, /^[0-9a-f]{8}$/);
    assertEquals(await sessionRef(sid), ref);
  });

  it("ne contient pas l'identifiant de session", async () => {
    const ref = await sessionRef(sid);
    assertEquals(sid.includes(ref!), false);
    assertNotEquals(await sessionRef(`${sid}x`), ref);
  });

  it("ne renvoie rien sans session", async () => {
    assertEquals(await sessionRef(undefined), undefined);
    assertEquals(await sessionRef(""), undefined);
  });
});
