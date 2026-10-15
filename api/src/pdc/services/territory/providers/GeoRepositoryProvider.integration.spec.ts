import { assertEquals } from "dep:assert";
import { afterAll, beforeAll, describe, it } from "dep:testing-bdd";

import { DenoDbContext, makeDenoDbBeforeAfter } from "@/pdc/providers/test/dbMacro.ts";

import { GeoRepositoryProvider } from "./GeoRepositoryProvider.ts";

describe("GeoRepositoryProvider", () => {
  let db: DenoDbContext;
  let repository: GeoRepositoryProvider;
  const { before, after } = makeDenoDbBeforeAfter();

  beforeAll(async () => {
    db = await before();
    repository = new GeoRepositoryProvider(db.connection);
  });

  afterAll(async () => {
    await after(db);
  });

  it("findBySiren returns the empty-shape result when no row matches", async () => {
    const result = await repository.findBySiren({ siren: "000000000" });
    assertEquals(result.reg_name, null);
    assertEquals(result.aom_name, null);
    assertEquals(result.dep_name, null);
    assertEquals(result.epci_name, null);
    assertEquals(result.coms, []);
  });

  it("findBySiren takes the reg/dep branch on 2 or 3 char siren", async () => {
    const result2 = await repository.findBySiren({ siren: "00" });
    const result3 = await repository.findBySiren({ siren: "000" });
    assertEquals(result2.reg_name, null);
    assertEquals(result3.reg_name, null);
  });
});
