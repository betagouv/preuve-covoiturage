import { InvalidParamsException } from '@/ilos/common/index.ts';
import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { StatelessContext } from '../entities/Context.ts';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException.ts';
import { generateCarpool } from '../tests/helpers.ts';
import { onDistanceRange, onDistanceRangeOrThrow } from './onDistanceRange.ts';

function distance(distance: number) {
  return StatelessContext.fromCarpool(1, generateCarpool({ distance }));
}

it('should return false if under range', async (t) => {
  assertFalse(onDistanceRange(distance(10), { min: 14, max: 16 }));
});

it('should return false if above range', async (t) => {
  assertFalse(onDistanceRange(distance(20), { min: 14, max: 16 }));
});

it('should return true if in range', async (t) => {
  assert(onDistanceRange(distance(15), { min: 14, max: 16 }));
});

it('should return true if on min', async (t) => {
  assert(onDistanceRange(distance(14), { min: 14, max: 16 }));
});

it('should return false if on max', async (t) => {
  assertFalse(onDistanceRange(distance(16), { min: 14, max: 16 }));
});

it('should return true on missing params', (t) => {
  assert(onDistanceRange(distance(10), {}));
});

it('should return true on missing min param if in range', (t) => {
  assert(onDistanceRange(distance(10), { max: 15 }));
});

it('should return false on missing min param if not in range', (t) => {
  assertFalse(onDistanceRange(distance(20), { max: 15 }));
});

it('should return true on missing max param if in range', (t) => {
  assert(onDistanceRange(distance(10), { min: 5 }));
});

it('should return false on missing max param if not in range', (t) => {
  assertFalse(onDistanceRange(distance(10), { min: 15 }));
});

it('should not throw if in range', async (t) => {
  t.notThrows(() => onDistanceRangeOrThrow(distance(15), { min: 14, max: 16 }));
});

it('should throw if not in range', async (t) => {
  t.throws(() => onDistanceRangeOrThrow(distance(20), { min: 14, max: 16 }), {
    instanceOf: NotEligibleTargetException,
  });
});

it('should throw on missing distance', (t) => {
  t.throws(() => onDistanceRange(distance(undefined), { max: 15 }), {
    instanceOf: InvalidParamsException,
  });
});
