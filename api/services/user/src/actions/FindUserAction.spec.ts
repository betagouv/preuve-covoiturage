import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { FindUserAction } from './FindUserAction';

chai.use(chaiAsPromised);
const { expect } = chai;

const mockUser = {
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
};

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async find(id: string): Promise<any> {
    return mockUser;
  }
}

const action = new FindUserAction(new FakeUserRepository());

describe('find a user action', () => {
  it('should work', async () => {
    const result = await action.handle({ id: mockUser['_id'] });
    expect(result).to.include(mockUser);
  });
});

