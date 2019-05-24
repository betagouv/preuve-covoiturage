import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { DeleteUserAction } from './DeleteUserAction';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;


const mockUser = {
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
};

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async delete(_id: string): Promise<any> {
    return mockUser;
  }
}

const action = new DeleteUserAction(new FakeUserRepository());

describe('Delete user action', () => {
  it('should work', async () => {
    const result = await action.handle({ id: mockUser._id });
    expect(result).to.include(mockUser);
  });
});

