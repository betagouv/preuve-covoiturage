import { InvalidParamsException } from '@ilos/common';
import test from 'ava';
import { StatelessContext } from '../entities/Context';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { generateCarpool } from '../tests/helpers';
import { onDistanceRange, onDistanceRangeOrThrow } from './onDistanceRange';

function distance(distance: number) {
  return StatelessContext.fromCarpool(1, generateCarpool({ distance }));
}

test('should return false if under range', async (t) => {
  t.false(onDistanceRange(distance(10), { min: 14, max: 16 }));
});

test('should return false if above range', async (t) => {
  t.false(onDistanceRange(distance(20), { min: 14, max: 16 }));
});

test('should return true if in range', async (t) => {
  t.true(onDistanceRange(distance(15), { min: 14, max: 16 }));
});

test('should return true if on min', async (t) => {
  t.true(onDistanceRange(distance(14), { min: 14, max: 16 }));
});

test('should return false if on max', async (t) => {
  t.false(onDistanceRange(distance(16), { min: 14, max: 16 }));
});

test('should return true on missing params', (t) => {
  t.true(onDistanceRange(distance(10), {}));
});

test('should return true on missing min param if in range', (t) => {
  t.true(onDistanceRange(distance(10), { max: 15 }));
});

test('should return false on missing min param if not in range', (t) => {
  t.false(onDistanceRange(distance(20), { max: 15 }));
});

test('should return true on missing max param if in range', (t) => {
  t.true(onDistanceRange(distance(10), { min: 5 }));
});

test('should return false on missing max param if not in range', (t) => {
  t.false(onDistanceRange(distance(10), { min: 15 }));
});

test('should not throw if in range', async (t) => {
  t.notThrows(() => onDistanceRangeOrThrow(distance(15), { min: 14, max: 16 }));
});

test('should throw if not in range', async (t) => {
  t.throws(() => onDistanceRangeOrThrow(distance(20), { min: 14, max: 16 }), {
    instanceOf: NotEligibleTargetException,
  });
});

test('should throw on missing distance', (t) => {
  t.throws(() => onDistanceRange(distance(undefined), { max: 15 }), {
    instanceOf: InvalidParamsException,
  });
});
