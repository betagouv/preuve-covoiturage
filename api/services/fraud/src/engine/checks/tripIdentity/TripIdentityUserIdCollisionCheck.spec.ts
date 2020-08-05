import anyTest from 'ava';

import { tripIdentityCheckMacro } from './tripIdentityCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { TripIdentityUserIdCollisionCheck } from './TripIdentityUserIdCollisionCheck';

const { test, range } = tripIdentityCheckMacro(anyTest, ServiceProvider, TripIdentityUserIdCollisionCheck);

test(
  'max',
  range,
  [
    { operator_id: '1', operator_user_id: '1' },
    { operator_id: '1', operator_user_id: '1' },
  ],
  1,
  1,
);
test(
  'min',
  range,
  [
    { operator_id: '1', operator_user_id: '1' },
    { operator_id: '1', operator_user_id: '2' },
  ],
  0,
  0,
);
test(
  'between',
  range,
  [
    { operator_id: '1', operator_user_id: '1' },
    { operator_id: '1', operator_user_id: '1' },
    { operator_id: '2', operator_user_id: '1' },
  ],
  0.6,
  0.7,
);
