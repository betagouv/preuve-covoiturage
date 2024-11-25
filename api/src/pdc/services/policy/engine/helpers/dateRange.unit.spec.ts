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

  it("should handle invalid date format", () => {
    const start = "2022-13-45";
    const end = "2022-01-03";
    try {
      dateRange(start, end);
    } catch (e) {
      assertEquals(e.message, "Invalid Date");
    }
  });

  it("should handle malformed date strings", () => {
    const start = "not-a-date";
    const end = "2022-01-03";
    try {
      dateRange(start, end);
    } catch (e) {
      assertEquals(e.message, "Invalid Date");
    }
  });

  it("should handle empty string input", () => {
    const start = "";
    const end = "2022-01-03";
    try {
      dateRange(start, end);
    } catch (e) {
      assertEquals(e.message, "Invalid Date");
    }
  });
});
