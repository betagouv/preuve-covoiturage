import { self } from './self';
import { tripIdentity } from './tripIdentity';
import { datetimeIdentity } from './datetimeIdentity';

export const checks = [...self, ...tripIdentity, ...datetimeIdentity];
