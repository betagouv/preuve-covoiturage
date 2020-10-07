import anyTest from 'ava';

import { tripIdentityCheckMacro } from './tripIdentityCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { TripIdentityFullnameCollisionCheck } from './TripIdentityFullnameCollisionCheck';

const { test, range } = tripIdentityCheckMacro(anyTest, ServiceProvider, TripIdentityFullnameCollisionCheck);

test(
  'max',
  range,
  [
    { lastname: 'Blum', firstname: 'Léon' },
    { lastname: 'Blum', firstname: 'Léon' },
  ],
  1,
  1,
);
test(
  'min',
  range,
  [
    { lastname: 'Blum', firstname: 'Léon' },
    { lastname: 'Blam', firstname: 'Maxime' },
  ],
  0,
  0,
);
test(
  'between',
  range,
  [
    { lastname: 'Blum', firstname: 'Léon' },
    { lastname: 'Blum', firstname: 'Léon' },
    { lastname: 'Blam', firstname: 'Maxime' },
  ],
  0.6,
  0.7,
);
