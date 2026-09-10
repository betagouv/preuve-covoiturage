import { assertEquals } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { safeCompare } from "./safeCompare.ts";

describe("safeCompare", () => {
  it("returns true for identical strings", () => {
    assertEquals(safeCompare("abc123", "abc123"), true);
  });
  it("returns false for different strings of same length", () => {
    assertEquals(safeCompare("abc123", "abc124"), false);
  });
  it("returns false for different lengths", () => {
    assertEquals(safeCompare("abc", "abcd"), false);
  });
  it("returns false for empty vs non-empty", () => {
    assertEquals(safeCompare("", "a"), false);
  });
  it("returns false when an input is not a string", () => {
    assertEquals(safeCompare(undefined as unknown as string, "a"), false);
    assertEquals(safeCompare("a", 1 as unknown as string), false);
  });
});
