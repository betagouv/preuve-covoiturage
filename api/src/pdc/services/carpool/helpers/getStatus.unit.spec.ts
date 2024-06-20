import { assertEquals, it } from "@/dev_deps.ts";
import { getStatus } from "./getStatus.ts";

it("should have ok status", () => {
  const created = new Date("2020-05-20T10:00:00.000Z");
  const dates = [
    new Date("2020-05-16T10:00:00.000Z"),
    new Date("2020-05-17T10:00:00.000Z"),
    new Date("2020-05-18T10:00:00.000Z"),
  ];
  assertEquals(getStatus(created, dates, 1000 * 60 * 60 * 24 * 5), "ok");
});

it("should have expired status", () => {
  const created = new Date("2020-05-20T10:00:00.000Z");
  const dates = [
    new Date("2020-05-16T10:00:00.000Z"),
    new Date("2020-05-13T10:00:00.000Z"),
    new Date("2020-05-18T10:00:00.000Z"),
  ];
  assertEquals(getStatus(created, dates, 1000 * 60 * 60 * 24 * 5), "expired");
});
