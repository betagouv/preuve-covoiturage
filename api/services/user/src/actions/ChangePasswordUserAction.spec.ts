import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
import { ChangePasswordUserAction, ChangePasswordUserInterface } from './ChangePasswordUserAction';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
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

const mockChangePasswordParams = <ChangePasswordUserInterface>{
  id: '1ab',
  oldPassword: 'oldPassword',
  newPassword: 'newPassword',
};

const cryptedNewPassword = 'cryptedNewPassword';

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async patch(id: string, patch: any): Promise<User> {
    return new User({
      ...mockUser,
      password: cryptedNewPassword,
    });
  }
  async find(id: string): Promise<User> {
    return mockUser;
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  async comparePassword(oldPwd: string, newPwd: string): Promise<boolean> {
    return true;
  }
}

const action = new ChangePasswordUserAction(new FakeUserRepository(), new FakeCryptoProvider());

describe('Change password - user action', () => {
  it('should work', async () => {
    const result = await action.handle(mockChangePasswordParams, { call: { user: mockConnectedUser } });

    expect(result).to.include({ password: cryptedNewPassword });
  });
});
