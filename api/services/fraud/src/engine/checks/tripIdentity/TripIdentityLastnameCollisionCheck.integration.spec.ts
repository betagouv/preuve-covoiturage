import { tripIdentityCheckMacro } from './tripIdentityCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { TripIdentityLastnameCollisionCheck } from './TripIdentityLastnameCollisionCheck';

const { test, range } = tripIdentityCheckMacro(ServiceProvider, TripIdentityLastnameCollisionCheck);

test('max', range, [{ lastname: 'Léon' }, { lastname: 'Léon' }], 1, 1);
test('min', range, [{ lastname: 'Léon' }, { lastname: 'Maxime' }], 0, 0);
test('between', range, [{ lastname: 'Léon' }, { lastname: 'Léon' }, { lastname: 'Maxime' }], 0.6, 0.7);
