// tslint:disable max-classes-per-file
import { describe } from 'mocha';
import chai from 'chai';

import { NormalizationIdentityAction } from './NormalizationIdentityAction';
import { LegacyIdentityInterface } from '../shared/common/interfaces/LegacyIdentityInterface';

const { expect } = chai;

describe('Identity normalization action', () => {
  it('Should work', async () => {
    const action = new NormalizationIdentityAction();
    const params: LegacyIdentityInterface = {
      firstname: 'Roger',
      travel_pass: {
        name: 'testTravelPass',
        user_id: 'user_test',
      },
    };
    const res = await action.handle(params);

    const { travel_pass, ...identity } = params;

    expect(res).to.deep.include(identity, 'Should include identity');

    expect(res).not.to.have.own.property('travel_pass');

    expect(res).to.have.own.property(
      'travel_pass_name',
      params.travel_pass.name,
      `Should have travel_pass_name equal to ${params.travel_pass.name}`,
    );
    expect(res).to.have.own.property(
      'travel_pass_user_id',
      params.travel_pass.user_id,
      `Should have travel_pass_user_id equal to ${params.travel_pass.user_id}`,
    );
  });
});
