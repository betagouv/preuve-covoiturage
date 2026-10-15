import { assertEquals } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { stripIpv6Brackets } from "./index.ts";

describe("stripIpv6Brackets", () => {
  it("returns a bare IPv6 literal from a WHATWG URL hostname", () => {
    assertEquals(stripIpv6Brackets(new URL("postgres://u@[2001:db8::1]:5432/db").hostname), "2001:db8::1");
  });

  it("leaves a DNS name untouched", () => {
    assertEquals(stripIpv6Brackets("postgres"), "postgres");
  });
});
