import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import { UserRepositoryProvider } from '../providers/UserRepositoryProvider';
import { CreateUserAction } from './CreateUserAction';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

// tslint:disable prefer-type-cast
const fakeUserRepository = <unknown>sinon.createStubInstance(UserRepositoryProvider, {
  async find(id) { return ...; },
}) as UserRepositoryProvider;

const action = new CreateUserAction(fakeUserRepository);

describe('Create user action', () => {
  it('should work', async () => {
    const r = await action.handle({id ... });
    expect(...)...
  });
});
