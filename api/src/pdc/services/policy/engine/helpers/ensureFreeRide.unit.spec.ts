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
import { generateCarpool } from "../tests/helpers.ts";
import { ensureFreeRide } from "./ensureFreeRide.ts";

function setup(driver_revenue: number) {
  return StatelessContext.fromCarpool(1, generateCarpool({ driver_revenue }));
}

it("should be equal to difference", async (t) => {
  const ctx = setup(100);
  const res = ensureFreeRide(ctx, 20);
  assertEquals(res, 80);
});

it("should be null", async (t) => {
  const ctx = setup(100);
  const res = ensureFreeRide(ctx, 120);
  assertEquals(res, 0);
});
