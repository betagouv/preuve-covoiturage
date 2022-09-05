import test from 'ava';

import { NormalizationIdentityAction } from './NormalizationIdentityAction';
import { LegacyIdentityInterface } from '../shared/common/interfaces/LegacyIdentityInterface';

test('Identity normalization action should work', async (t) => {
  const action = new NormalizationIdentityAction();
  const params: LegacyIdentityInterface = {
    firstname: 'Roger',
    travel_pass: {
      name: 'testTravelPass',
      user_id: 'user_test',
    },
  };
  const res = await action.handle(params);

  t.true(Reflect.ownKeys(res).indexOf('firstname') > -1, 'Should include identity');
  t.false(Reflect.ownKeys(res).indexOf('travel_pass') > -1, 'Should not include travel_pass');

  t.true(Reflect.ownKeys(res).indexOf('travel_pass_name') > -1, 'Should include travel_pass_name');
  t.is(
    res.travel_pass_name,
    params.travel_pass.name,
    `Should have travel_pass_name equal to ${params.travel_pass.name}`,
  );
  t.true(Reflect.ownKeys(res).indexOf('travel_pass_user_id') > -1, 'Should include travel_pass_user_id');
  t.is(
    res.travel_pass_user_id,
    params.travel_pass.user_id,
    `Should have travel_pass_user_id equal to ${params.travel_pass.user_id}`,
  );
});
