import { assertEquals } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { isTestAuthEnabled } from "./enabled.ts";

describe("isTestAuthEnabled", () => {
  it("is off by default", () => assertEquals(isTestAuthEnabled("local", false), false));
  it("is on with flag in local", () => assertEquals(isTestAuthEnabled("local", true), true));
  it("is on with flag in any non-prod env", () => assertEquals(isTestAuthEnabled("staging", true), true));
  it("refuses flag in production", () => assertEquals(isTestAuthEnabled("production", true), false));
  it("refuses flag in demo", () => assertEquals(isTestAuthEnabled("demo", true), false));
  it("refuses flag when any of several envs is forbidden", () => {
    assertEquals(isTestAuthEnabled(["local", "production"], true), false);
    assertEquals(isTestAuthEnabled(["local", "local"], true), true);
  });
});
