// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
import { LoginUserAction } from './LoginUserAction';
import { UserLoginParamsInterface } from '../interfaces/UserLoginParamsInterface';
import { ConfigProviderInterfaceResolver } from "@ilos/provider-config";

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
  password: 'cryptedPassword',
  status: 'active',
});

const mockLoginParams = <UserLoginParamsInterface>{
  email: mockUser.email,
  password: 'password',
};


// todo: use configproviderinterfaceresolver
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  get(key: string, fallback?: any): any {
    return 'active';
  }
}


class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
    if (params.email === mockUser.email) {
      return mockUser;
    }
  }

  public async patch(id: string, user: UserDbInterface): Promise<User> {
    return new User({
      ...mockUser,
      lastConnectedAt: new Date(),
    });
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  async comparePassword(plain: string, crypted: string): Promise<boolean> {
    if (crypted === mockUser.password && plain === mockLoginParams.password) {
      return true;
    }
  }
}

const action = new LoginUserAction(new FakeConfigProvider(), new FakeCryptoProvider(), new FakeUserRepository());

describe('login with right email & pwd - user action', () => {
  it('should work', async () => {
    const result = await action.handle(mockLoginParams, { call: { user: {} }, channel: { service: '' } });
    expect(result).to.include({
      _id: mockUser._id,
    });
  });
});
