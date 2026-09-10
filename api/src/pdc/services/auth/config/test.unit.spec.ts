import { assertEquals, assertThrows } from "dep:assert";
import { afterEach, describe, it } from "dep:testing-bdd";
import { EnvNotFoundException } from "@/lib/env/index.ts";
import { accounts } from "./test.ts";

const KEYS = [
  "APIE2E_AUTH_ADMIN_EMAIL",
  "APIE2E_AUTH_ADMIN_PASSWORD",
  "APIE2E_AUTH_OPERATOR_EMAIL",
  "APIE2E_AUTH_OPERATOR_PASSWORD",
  "APIE2E_AUTH_TERRITORY_EMAIL",
  "APIE2E_AUTH_TERRITORY_PASSWORD",
];

describe("auth test config", () => {
  afterEach(() => KEYS.forEach((k) => Deno.env.delete(k)));

  it("accounts() throws when a variable is missing", () => {
    assertThrows(() => accounts(), EnvNotFoundException);
  });

  it("accounts() builds the map from env", () => {
    Deno.env.set("APIE2E_AUTH_ADMIN_EMAIL", "a@x.test");
    Deno.env.set("APIE2E_AUTH_ADMIN_PASSWORD", "pa");
    Deno.env.set("APIE2E_AUTH_OPERATOR_EMAIL", "o@x.test");
    Deno.env.set("APIE2E_AUTH_OPERATOR_PASSWORD", "po");
    Deno.env.set("APIE2E_AUTH_TERRITORY_EMAIL", "t@x.test");
    Deno.env.set("APIE2E_AUTH_TERRITORY_PASSWORD", "pt");
    const map = accounts();
    assertEquals(map.get("a@x.test"), "pa");
    assertEquals(map.get("o@x.test"), "po");
    assertEquals(map.get("t@x.test"), "pt");
    assertEquals(map.size, 3);
  });
});
