import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { PatchUserAction } from './PatchUserAction';
import { UserDbInterface } from '../interfaces/UserInterfaces';


chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

const mockUser = {
  _id: '1ab',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
};

const mockUserNewProperties = {
  firstname: 'johnny',
  lastname: 'smith',
};


class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async patch(id: string, patch?: any): Promise<UserDbInterface> {
    return {
      _id: id,
      email: 'john.schmidt@example.com',
      firstname: mockUserNewProperties.firstname,
      lastname: mockUserNewProperties.lastname,
      phone: mockUser.phone,
      group: 'registry',
      role: 'admin',
      aom: '1ac',
      permissions: [
        'user.list',
      ],
    };
  }
}

const action = new PatchUserAction(new FakeUserRepository());

describe('Update user action', () => {
  it('should work', async () => {
    const result = await action.handle({  id: mockUser._id , patch: mockUserNewProperties });
    expect(result).to.include({ _id: mockUser._id , ...mockUserNewProperties });
  });
});

