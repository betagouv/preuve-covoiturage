import { assertEquals, describe, it } from "@/dev_deps.ts";
import { dateRange } from "./dateRange.ts";

describe("dateRange", () => {
  it("should return a range of dates", () => {
    const start = new Date("2022-01-01");
    const end = new Date("2022-01-03");
    const result = dateRange(start, end);
    assertEquals(result, ["2022-01-01", "2022-01-02", "2022-01-03"]);
  });

  it("should return a range of dates when given strings", () => {
    const start = "2022-01-01";
    const end = "2022-01-03";
    const result = dateRange(start, end);
    assertEquals(result, ["2022-01-01", "2022-01-02", "2022-01-03"]);
  });

  it("should return a range over several months", () => {
    const start = "2022-01-30";
    const end = "2022-02-02";
    const result = dateRange(start, end);
    assertEquals(result, ["2022-01-30", "2022-01-31", "2022-02-01", "2022-02-02"]);
  });

  it("should sort input dates", () => {
    const start = "2022-01-03";
    const end = "2022-01-01";
    const result = dateRange(start, end);
    assertEquals(result, ["2022-01-01", "2022-01-02", "2022-01-03"]);
  });

  it("should sort more than two dates", () => {
    const start = "2022-01-03";
    const middle = "2022-01-02";
    const end = "2022-01-01";
    const result = dateRange(start, middle, end);
    assertEquals(result, ["2022-01-01", "2022-01-02", "2022-01-03"]);
  });
});
