import test from 'ava';
import { BoundedSlices, UnboundedSlices } from '@shared/policy/common/interfaces/Slices.ts';
import { findBoundary, toBoundedSlices, wrapSlices as wrap } from './wrapSlicesHelper.ts';

test('[wrap] No valid slices returns empty array', (t) => {
  t.deepEqual(wrap(undefined), []);
  t.deepEqual(wrap(null), []);
  t.deepEqual(wrap([]), []);
  // @ts-expect-error
  t.deepEqual(wrap('Not an array at all'), []);
});

test('[wrap] Add slices before and after', (t) => {
  const slices: BoundedSlices = [{ start: 10, end: 20 }];
  const wrapped = wrap(slices);
  t.deepEqual(wrapped, [{ start: 0, end: 10 }, { start: 10, end: 20 }, { start: 20 }]);
});

test('[wrap] Add slices after', (t) => {
  const slices: BoundedSlices = [
    { start: 0, end: 15 },
    { start: 15, end: 30 },
  ];
  const wrapped = wrap(slices);
  t.deepEqual(wrapped, [{ start: 0, end: 15 }, { start: 15, end: 30 }, { start: 30 }]);
});

test('[wrap] No additional end slice on Unbounded slices', (t) => {
  const slices: UnboundedSlices = [{ start: 10, end: 15 }, { start: 15 }];
  const wrapped = wrap(slices);
  t.deepEqual(wrapped, [{ start: 0, end: 10 }, ...slices]);
});

test('[wrap] No wrapping on Unbounded slices', (t) => {
  const slices: UnboundedSlices = [{ start: 0, end: 15 }, { start: 15 }];
  const wrapped = wrap(slices);
  t.deepEqual(wrapped, slices);
});

test('[toBoundedSlices] bounded to bounded', (t) => {
  const slices: BoundedSlices = [
    { start: 10, end: 15 },
    { start: 15, end: 30 },
  ];
  t.deepEqual(toBoundedSlices(slices), slices);
});

test('[toBoundedSlices] unbounded to bounded', (t) => {
  const slices: BoundedSlices = [
    { start: 10, end: 15 },
    { start: 15, end: 30 },
  ];
  t.deepEqual(toBoundedSlices([...slices, { start: 30 }] as UnboundedSlices), slices);
});

test('[boundaries] find min and max (sorted)', (t) => {
  const slices: BoundedSlices = [
    { start: 10, end: 20 },
    { start: 20, end: 30 },
    { start: 30, end: 40 },
  ];

  t.is(findBoundary('min', slices), 10);
  t.is(findBoundary('max', slices), 40);
});

test('[boundaries] find min and max (unsorted)', (t) => {
  const slices: BoundedSlices = [
    { start: 30, end: 40 },
    { start: 20, end: 30 },
    { start: 50, end: 100 },
    { start: 10, end: 20 },
  ];

  t.is(findBoundary('min', slices), 10);
  t.is(findBoundary('max', slices), 100);
});
