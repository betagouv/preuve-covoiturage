import { assertEquals } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { toCampaignTerritory } from "./campaignConditionTerritory.ts";

describe("toCampaignTerritory", () => {
  const group = (has_versions: boolean, selectors: { type: string; value: string }[]) => ({
    name: "Territoire",
    has_versions,
    selectors,
  });

  it("un territoire à périmètre versionné est un territoire custom du datalake", () => {
    assertEquals(toCampaignTerritory(36709, group(true, [{ type: "epci", value: "200067999" }])), {
      territory_type: "custom",
      territory_code: "36709",
      territory_label: "Territoire",
    });
  });

  it("un sélecteur unique de type géographique donne son couple type/code", () => {
    assertEquals(toCampaignTerritory(12, group(false, [{ type: "aom", value: "200067999" }])), {
      territory_type: "aom",
      territory_code: "200067999",
      territory_label: "Territoire",
    });
  });

  it("refuse un territoire inconnu du datalake (plusieurs sélecteurs, arrondissement, aucun)", () => {
    const two = [{ type: "epci", value: "200067999" }, { type: "epci", value: "200069730" }];
    assertEquals(toCampaignTerritory(12, group(false, two)), null);
    assertEquals(toCampaignTerritory(12, group(false, [{ type: "arr", value: "69381" }])), null);
    assertEquals(toCampaignTerritory(12, group(false, [])), null);
  });
});
