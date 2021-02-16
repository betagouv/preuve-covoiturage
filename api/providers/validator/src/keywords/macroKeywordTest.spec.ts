import test from 'ava';

import { macroKeyword } from './macroKeyword';

test('should return schema if macro exist', (t) => {
  t.true(Reflect.ownKeys(macroKeyword.macro('uuid')).length > 0);
});

test('should return empty schema if macro doest not exist', (t) => {
  t.true(Reflect.ownKeys(macroKeyword.macro('aa')).length === 0);
});
