import test from 'ava';

import { objectidCustomFormat } from './objectidCustomFormat';

test('valid ObjectId', (t) => {
  const id = '5d07eabd57ce4d70ae6a8508';
  t.true((objectidCustomFormat as any)(id));
});

test('valid ObjectId uppercase', (t) => {
  const id = '5d07eb19990207328440c338'.toUpperCase();
  t.true((objectidCustomFormat as any)(id));
});

test('too short', (t) => {
  const id = '5d07eb199902';
  t.false((objectidCustomFormat as any)(id));
});

test('too long', (t) => {
  const id = '5d07eabd57ce4d70ae6a8508d57ce4d7';
  t.false((objectidCustomFormat as any)(id));
});

test('wrong chars', (t) => {
  const id = '5d07eb1-.^0207328440c338';
  t.false((objectidCustomFormat as any)(id));
});
