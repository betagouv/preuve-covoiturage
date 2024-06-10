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
import { todayFrequencies } from "./todayFrequencies.helper.ts";

it("On Monday", (t) => {
  const clock = sinon.useFakeTimers(new Date("2023-02-13"));
  assertObjectMatch(todayFrequencies(), ["daily", "weekly"]);
  clock.restore();
});

it("On Tuesday", (t) => {
  const clock = sinon.useFakeTimers(new Date("2023-02-14"));
  assertObjectMatch(todayFrequencies(), ["daily"]);
  clock.restore();
});

it("On 1st day of the month (not a Monday)", (t) => {
  const clock = sinon.useFakeTimers(new Date("2023-02-01"));
  assertObjectMatch(todayFrequencies(), ["daily", "monthly"]);
  clock.restore();
});

it("On 1st day of the month (a Monday)", (t) => {
  const clock = sinon.useFakeTimers(new Date("2022-08-01"));
  assertObjectMatch(todayFrequencies(), ["daily", "weekly", "monthly"]);
  clock.restore();
});
