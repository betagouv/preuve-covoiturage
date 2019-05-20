import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import { UserRepositoryProvider } from '../providers/UserRepositoryProvider';
import { User } from '../entities/User';
import { FindUserAction } from './FindUserAction';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const mockUser = <User>{
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
};

const fakeUserRepository = <UserRepositoryProvider>sinon.createStubInstance(UserRepositoryProvider, {
  async find(id: string) {
    return mockUser;
  },
});

const action = new FindUserAction(fakeUserRepository);

describe('Create user action', () => {
  it('should work', async () => {
    const result = await action.handle({ id: mockUser['_id'] });
    expect(result).to.equal(mockUser);
  });
});

