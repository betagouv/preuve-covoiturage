import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';

import { IdentityNormalizerProvider } from './IdentityNormalizerProvider.ts';
import { LegacyIdentityInterface } from '../interfaces/index.ts';

it('Identity normalizer should work', async (t) => {
  const normalizer = new IdentityNormalizerProvider();
  const params: LegacyIdentityInterface = {
    firstname: 'Roger',
    travel_pass: {
      name: 'testTravelPass',
      user_id: 'user_test',
    },
  };
  const res = await normalizer.handle(params);

  assert(Reflect.ownKeys(res).indexOf('firstname') > -1, 'Should include identity');
  assertFalse(Reflect.ownKeys(res).indexOf('travel_pass') > -1, 'Should not include travel_pass');

  assert(Reflect.ownKeys(res).indexOf('travel_pass_name') > -1, 'Should include travel_pass_name');
  assertEquals(
    res.travel_pass_name,
    params.travel_pass.name,
    `Should have travel_pass_name equal to ${params.travel_pass.name}`,
  );
  assert(Reflect.ownKeys(res).indexOf('travel_pass_user_id') > -1, 'Should include travel_pass_user_id');
  assertEquals(
    res.travel_pass_user_id,
    params.travel_pass.user_id,
    `Should have travel_pass_user_id equal to ${params.travel_pass.user_id}`,
  );
});
