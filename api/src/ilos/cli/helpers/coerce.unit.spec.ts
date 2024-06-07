import { assertEquals, describe, it } from "@/dev_deps.ts";
import { coerceDate, coerceIntList } from "./coerce.ts";

describe("coerce integer list", () => {
  it("comma separated ok", (t) => {
    assertEquals(coerceIntList("1,2,3"), [1, 2, 3]);
  });

  it("remove non numbers", (t) => {
    assertEquals(coerceIntList("1,2,3,a,b,c"), [1, 2, 3]);
  });

  it("float to int", (t) => {
    assertEquals(coerceIntList("1.1,2.2,3.3"), [1, 2, 3]);
  });

  it("single number", (t) => {
    assertEquals(coerceIntList("1"), [1]);
  });

  it("empty list", (t) => {
    assertEquals(coerceIntList("NaN"), []);
  });

  it("hexa is ok", (t) => {
    assertEquals(coerceIntList("0x10, 0x20"), [16, 32]);
  });
});

describe("coerce date", () => {
  it("YYYY-MM-DD UTC", (t) => {
    assertEquals(coerceDate("2023-01-01"), new Date("2023-01-01T00:00:00Z"));
  });

  it("YYYY-MM-DDTHH:MM:SSZ", (t) => {
    assertEquals(
      coerceDate("2023-01-01T00:00:00Z"),
      new Date("2023-01-01T00:00:00Z"),
    );
  });

  it("YYYY-MM-DDTHH:MM:SS+0100", (t) => {
    assertEquals(
      coerceDate("2023-01-01T00:00:00+0100"),
      new Date("2023-01-01T00:00:00+0100"),
    );
  });

  it("null if not a date", (t) => {
    assertEquals(coerceDate("abc"), null);
    assertEquals(coerceDate("1234567890"), null);
  });
});
