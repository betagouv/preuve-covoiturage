import { assertEquals } from "dep:assert";
import * as log from "dep:log";
import { describe, it } from "dep:testing-bdd";
import { setupLogger } from "./index.ts";

describe("setupLogger", () => {
  // Le logger par défaut de std/log reste en INFO si seul le handler est réglé.
  it("règle aussi le niveau du logger par défaut", () => {
    setupLogger("DEBUG");
    assertEquals(log.getLogger().levelName, "DEBUG");
  });

  it("filtre le debug au niveau INFO", () => {
    setupLogger("INFO");
    assertEquals(log.getLogger().levelName, "INFO");
  });
});
