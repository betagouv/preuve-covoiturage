// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';
import { Container } from '@ilos/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserConfirmEmailParamsInterface } from '../interfaces/actions/UserConfirmEmailParamsInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';

import { ConfirmEmailUserAction } from './ConfirmEmailUserAction';

import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';

import { mockNewUserBase } from '../../tests/mocks/newUserBase';

import { User } from '../entities/User';
import { defaultUserProperties } from '../../tests/mocks/defaultUserProperties';

chai.use(chaiAsPromised);
const { expect } = chai;

const mockUser = {
  ...mockNewUserBase,
  status: 'notActive',
  _id: '5d08a669f691dd623ae9378a',
};

const mockResetPasswordParams = <UserConfirmEmailParamsInterface>{
  token: 'W0mn7FUNQI53qAaKW8lxIiTB9b03GP1N',
  confirm: 'Y5ySSJRrlX49aSC9G1eIBb0dMWLv95aT',
};

@Container.provider()
class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async boot() {
    return;
  }
  public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
    return new User({
      ...mockUser,
      emailChangeAt: new Date(),
    });
  }

  public async update(user: any): Promise<User> {
    return new User({
      ...user,
    });
  }
}

@Container.provider()
class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  async compareForgottenToken(plainToken: string, cryptedToken: string): Promise<boolean> {
    return true;
  }
}

@Container.provider()
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  async boot() {
    return;
  }
  get(key: string, fallback?: any): any {
    if (key === 'user.tokenExpiration.emailConfirm') {
      return '86400';
    }
    return 'active';
  }
}

class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [ConfirmEmailUserAction];
  readonly alias: any[] = [
    [ConfigProviderInterfaceResolver, FakeConfigProvider],
    [CryptoProviderInterfaceResolver, FakeCryptoProvider],
    [UserRepositoryProviderInterfaceResolver, FakeUserRepository],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
  ];

  protected registerConfig() {}

  protected registerTemplate() {}
}

let serviceProvider;
let handlers;
let action;

describe('USER ACTION - Confirm email', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.boot();
    handlers = serviceProvider.getContainer().getHandlers();
    action = serviceProvider.getContainer().getHandler(handlers[0]);
  });

  it('should change status to active', async () => {
    const result = await action.call({
      method: 'user:confirmEmail',
      context: { call: { user: {} }, channel: { service: '' } },
      params: mockResetPasswordParams,
    });

    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockUser,
      status: 'active',
    });

    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockUser,
      status: 'active',
    });
  });
});
