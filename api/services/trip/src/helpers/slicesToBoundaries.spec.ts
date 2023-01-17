import test from 'ava';
import { slicesToBoundaries } from './slicesToBoundaries.helper';

test('No slices', (t) => {
  t.deepEqual(slicesToBoundaries([]), { start: -1, end: -1 });
});

test('1 slice: increase', (t) => {
  t.deepEqual(slicesToBoundaries([{ start: 1, end: 2 }], t), { start: 1, end: 2 });
});

test('1 slice: decrease', (t) => {
  t.deepEqual(slicesToBoundaries([{ start: 1, end: 0 }]), { start: 0, end: 1 });
});

test('1 slice: starts at 0', (t) => {
  t.deepEqual(slicesToBoundaries([{ start: 0, end: 1 }]), { start: 0, end: 1 });
});

test('1 slice: no end', (t) => {
  t.deepEqual(slicesToBoundaries([{ start: 0, end: -1 }]), { start: 0, end: -1 });
});

test('2 slices', (t) => {
  t.deepEqual(
    slicesToBoundaries([
      { start: 0, end: 1 },
      { start: 1, end: 2 },
    ]),
    { start: 0, end: 2 },
  );
});

test('3 slices with gaps', (t) => {
  t.deepEqual(
    slicesToBoundaries([
      { start: 0, end: 1 },
      { start: 10, end: 20 },
      { start: 100, end: 200 },
    ]),
    { start: 0, end: 200 },
  );
});

test('3 slices skip first', (t) => {
  t.deepEqual(
    slicesToBoundaries([
      { start: -1, end: 5 }, // will be skipped
      { start: 10, end: 20 },
      { start: 100, end: 200 },
    ]),
    { start: -1, end: 200 },
  );
});

test('3 slices with inner slices', (t) => {
  t.deepEqual(
    slicesToBoundaries(
      [
        { start: 1, end: 1000 },
        { start: 10, end: 20 },
        { start: 100, end: 200 },
      ],
      t,
    ),
    { start: 1, end: 1000 },
  );
});
