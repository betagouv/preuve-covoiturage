import { assertEquals, assertThrows, it } from "@/dev_deps.ts";

import { StatelessContext } from "../entities/Context.ts";
import { generateCarpool } from "../tests/helpers.ts";
import { atDate } from "./atDate.ts";

function setup(datetime: Date) {
  return StatelessContext.fromCarpool(1, generateCarpool({ datetime }));
}

it("should return false if not in list", async () => {
  const ctx = setup(new Date("2022-01-01"));
  const res = atDate(ctx, { dates: [] });
  assertEquals(res, false);
});

it("should return true if in list", async () => {
  const ctx = setup(new Date("2022-01-01"));
  const res = atDate(ctx, { dates: ["2022-01-01"] });
  assertEquals(res, true);
});

it("should throw if not an array", async () => {
  const ctx = setup(new Date("2022-01-01"));
  assertThrows(
    () => {
      atDate(ctx, { dates: "" as unknown as Array<string> });
    },
  );
});
