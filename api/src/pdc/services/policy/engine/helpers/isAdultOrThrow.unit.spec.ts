import {
  afterAll,
  afterEach,
  assert,
  assertEquals,
  assertFalse,
  assertObjectMatch,
  assertThrows,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@/dev_deps.ts";

import { StatelessContext } from "../entities/Context.ts";
import { NotEligibleTargetException } from "../exceptions/NotEligibleTargetException.ts";
import { generateCarpool } from "../tests/helpers.ts";
import { isAdultOrThrow } from "./isAdultOrThrow.ts";

function setup(passenger_is_over_18: boolean) {
  return StatelessContext.fromCarpool(
    1,
    generateCarpool({ passenger_is_over_18 }),
  );
}

it("should throw if not an adult", async (t) => {
  const ctx = setup(false);
  await assertThrows<NotEligibleTargetException>(async () => {
    isAdultOrThrow(ctx);
  });
});

it("should return true if adult", async (t) => {
  const ctx = setup(true);
  const res = isAdultOrThrow(ctx);
  assertEquals(res, true);
});
