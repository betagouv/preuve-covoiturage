import { assertObjectMatch, assertThrows, describe, it } from "@/dev_deps.ts";
import { ConfigStore } from "./Config.ts";

describe("Config provider", () => {
  it("works with simple object", async () => {
    const config = new ConfigStore({
      helloWorld: { hello: "world" },
    });
    assertObjectMatch(config.get("helloWorld"), { hello: "world" });
  });

  it("fails if not found without fallback", async () => {
    const config = new ConfigStore({
      helloWorld: { hello: "world" },
    });
    assertThrows(
      () => config.get("helloMissing"),
      Error,
      "Unknown config key 'helloMissing'",
    );
  });

  it("works if not found with fallback", async () => {
    const config = new ConfigStore({
      helloWorld: { hello: "world" },
    });
    assertObjectMatch(config.get("helloMissing", { hello: "fallback" }), {
      hello: "fallback",
    });
  });
});
