// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Providers } from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
import { ResetPasswordUserAction, ResetPasswordUserInterface } from './ResetPasswordUserAction';

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
  forgottenAt: new Date(),
});

const mockResetPasswordParams = <ResetPasswordUserInterface>{
  token: 'tokenFromEmail',
  reset: 'resetFromEmail',
  password: 'newPassword',
};

const cryptedPassword = 'cryptedPassword';

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  public async findUserByParam(param: { [prop: string]: string }): Promise<User> {
    return mockUser;
  }

  public async update(user:UserDbInterface): Promise<User> {
    return new User({
      ...mockUser,
    });
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver{
  async cryptPassword(plainPassword: string): Promise<string> {
    return cryptedPassword;
  }
  async compareForgottenToken(plainToken: string, cryptedToken: string): Promise<boolean> {
    return true;
  }
}

// todo: use configproviderinterfaceresolver
class FakeConfigProvider extends Providers.ConfigProvider {
  constructor(protected env: Providers.EnvProvider) {
    super(env);
  }

  get(key: string, fallback?: any): any {
    if (key === 'user.tokenExpiration.passwordReset') {
      return 86400;
    }
  }
}

const envProvider = new Providers.EnvProvider();

const action = new ResetPasswordUserAction(
  new FakeConfigProvider(envProvider),
  new FakeCryptoProvider(),
  new FakeUserRepository(),
);

describe('Reset password with token action', () => {
  it('should work', async () => {
    const result = await action.handle(mockResetPasswordParams,
      { call: { user: {} }, channel: { service: '' } });

    expect(result).to.include({
      password: cryptedPassword,
    });
  });
});

