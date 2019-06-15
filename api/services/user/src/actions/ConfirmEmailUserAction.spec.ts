// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { ConfirmEmailUserAction } from './ConfirmEmailUserAction';
import { UserConfirmEmailParamsInterface } from '../interfaces/actions/UserConfirmEmailParamsInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const mockUser = new User({
  _id: '1ac',
  email: 'edouard.nelson@example.com',
  firstname: 'edouard',
  lastname: 'nelson',
  phone: '0622222233',
  group: 'registry',
  role: 'admin',
  aom: 'aomid',
  permissions: [],
  emailChangeAt: new Date(),
});

const mockResetPasswordParams = <UserConfirmEmailParamsInterface>{
  token: 'tokenFromEmail',
  confirm: 'confirmFromEmail',
};

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
    return mockUser;
  }

  public async update(user: UserBaseInterface): Promise<User> {
    return new User({
      ...mockUser,
    });
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  async compareForgottenToken(plainToken: string, cryptedToken: string): Promise<boolean> {
    return true;
  }
}
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  get(key: string, fallback?: any): any {
    if (key === 'user.tokenExpiration.emailConfirm') {
    return '86400';
    }
    return 'active';
  }
}

const action = new ConfirmEmailUserAction(
  new FakeConfigProvider(),
  new FakeCryptoProvider(),
  new FakeUserRepository(),
);

describe('USER ACTION - confirm email', () => {
  it('should work', async () => {
    const result = await action.handle(mockResetPasswordParams, { call: { user: {} }, channel: { service: '' } });
    expect(result).to.include({
      status: 'active',
    });
  });
});
