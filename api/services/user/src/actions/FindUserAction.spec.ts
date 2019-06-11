import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { FindUserAction } from './FindUserAction';

chai.use(chaiAsPromised);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  aom: '1ac',
  permissions: ['user.list'],
};
const mockUser = new User({
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  aom: '1ac',
  permissions: ['user.list'],
});

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async findUser(id: string): Promise<User> {
    return mockUser;
  }
}

const action = new FindUserAction(new FakeUserRepository());

describe('find a user action', () => {
  it('should work', async () => {
    const result = await action.handle({ id: mockUser['_id'] }, { call: { user: mockConnectedUser } });
    expect(result).to.include(mockUser);
  });
});
