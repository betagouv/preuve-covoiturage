import { tripIdentityCheckMacro } from './tripIdentityCheckMacro';
import { TripIdentityPhoneCollisionCheck } from './TripIdentityPhoneCollisionCheck';

const { test, range } = tripIdentityCheckMacro(TripIdentityPhoneCollisionCheck);

test('max', range, [{ phone: '+33836656565' }, { phone: '+33836656565' }], 1, 1);
test('min', range, [{ phone: '+33836656564' }, { phone: '+33836656565' }], 0, 0);
test('between', range, [{ phone: '+33836656565' }, { phone: '+33836656565' }, { phone: '+33836656564' }], 0.6, 0.7);
