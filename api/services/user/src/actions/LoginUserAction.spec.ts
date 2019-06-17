// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { Container, Interfaces } from '@ilos/core';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
import { LoginUserAction } from './LoginUserAction';
import { UserLoginParamsInterface } from '../interfaces/actions/UserLoginParamsInterface';
import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';
import { CreateUserAction } from './CreateUserAction';
import { defaultUserProperties } from '../../tests/mocks/defaultUserProperties';
import { mockNewUserBase } from '../../tests/mocks/newUserBase';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const mockUser = { ...mockNewUserBase, _id: 'mockUserId', status: 'active' };

const cryptedPassword = 'cryptedPassword';

const mockLoginParams = <UserLoginParamsInterface>{
  email: mockUser.email,
  password: 'password',
};

@Container.provider()
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  async boot() {
    return;
  }
  get(key: string, fallback?: any): any {
    return 'active';
  }
}

@Container.provider()
class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async boot() {
    return;
  }
  public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
    if (params.email === mockUser.email) {
      return new User({
        ...mockUser,
        password: cryptedPassword,
      });
    }
  }

  public async patch(id: string, user: UserBaseInterface): Promise<User> {
    return new User({
      ...mockUser,
      lastConnectedAt: new Date(),
    });
  }
}

@Container.provider()
class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  async boot() {
    return;
  }
  async comparePassword(plain: string, crypted: string): Promise<boolean> {
    if (crypted === cryptedPassword && plain === mockLoginParams.password) {
      return true;
    }
  }
}

class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [LoginUserAction];
  readonly alias: any[] = [
    [ConfigProviderInterfaceResolver, FakeConfigProvider],
    [CryptoProviderInterfaceResolver, FakeCryptoProvider],
    [UserRepositoryProviderInterfaceResolver, FakeUserRepository],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
  ];

  protected registerConfig() {}
}

let serviceProvider;
let handlers;
let action;

describe('USER ACTION - Login', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.boot();
    handlers = serviceProvider.getContainer().getHandlers();
    action = serviceProvider.getContainer().getHandler(handlers[0]);
  });
  it('should login with right email & pwd', async () => {
    const result = await action.call({
      method: 'user:login',
      context: { call: { user: {} }, channel: { service: '' } },
      params: mockLoginParams,
    });
    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockUser,
    });
  });
});
