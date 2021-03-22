import anyTest from 'ava';

import { tripIdentityCheckMacro } from './tripIdentityCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { TripIdentityEmailCollisionCheck } from './TripIdentityEmailCollisionCheck';

const { test, range } = tripIdentityCheckMacro(anyTest, ServiceProvider, TripIdentityEmailCollisionCheck);

test('max', range, [{ email: 'toto@email.com' }, { email: 'toto@email.com' }], 1, 1);
test('min', range, [{ email: 'toto@email.com' }, { email: 'tata@email.com' }], 0, 0);
test(
  'between',
  range,
  [{ email: 'toto@email.com' }, { email: 'toto@email.com' }, { email: 'tata@email.com' }],
  0.6,
  0.7,
);
