import anyTest from 'ava';

import { tripIdentityCheckMacro } from './tripIdentityCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { TripIdentityTravelpassCollisionCheck } from './TripIdentityTravelpassCollisionCheck';

const { test, range } = tripIdentityCheckMacro(anyTest, ServiceProvider, TripIdentityTravelpassCollisionCheck);

test(
  'max',
  range,
  [
    { travel_pass_name: 'IDFM', travel_pass_user_id: '1' },
    { travel_pass_name: 'IDFM', travel_pass_user_id: '1' },
  ],
  1,
  1,
);
test(
  'min',
  range,
  [
    { travel_pass_name: 'IDFM', travel_pass_user_id: '1' },
    { travel_pass_name: 'IDFM', travel_pass_user_id: '2' },
  ],
  0,
  0,
);
test(
  'between',
  range,
  [
    { travel_pass_name: 'IDFM', travel_pass_user_id: '1' },
    { travel_pass_name: 'IDFM', travel_pass_user_id: '1' },
    { travel_pass_name: 'NOT_IDFM', travel_pass_user_id: '1' },
  ],
  0.6,
  0.7,
);
