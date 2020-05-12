import { self } from './self';
import { tripIdentity } from './tripIdentity';
import { datetimeIdentity } from './datetimeIdentity';

import { TripDatetimeInconsistencyCheck } from './TripDatetimeInconsistencyCheck';
import { TripDriverIdentityInconsistencyCheck } from './TripDriverIdentityInconsistencyCheck';

export const checks = [
  ...self,
  ...tripIdentity,
  ...datetimeIdentity,
  TripDatetimeInconsistencyCheck,
  TripDriverIdentityInconsistencyCheck,
];
