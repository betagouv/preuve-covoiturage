import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';

import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { PatchUserAction } from './PatchUserAction';
import { UserDbInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
import { MockFactory } from '../../tests/mocks/factory';

const mockFactory = new MockFactory();

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
    return new User({
      _id: id,
      email: 'john.schmidt@example.com',
      firstname: mockUserNewProperties.firstname,
      lastname: mockUserNewProperties.lastname,
      phone: mockUser.phone,
      group: 'registry',
      role: 'admin',
      aom: '1ac',
      permissions: ['user.list'],
    });
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver {}

const action = new PatchUserAction(new FakeUserRepository(), new FakeCryptoProvider());

describe('Update user action', () => {
  it('should work', async () => {
    const result = await action.handle(
      { id: mockUser._id, patch: mockUserNewProperties },
      { call: { user: mockFactory.newUser() } },
    );
    expect(result).to.include({ _id: mockUser._id, ...mockUserNewProperties });
  });
});
