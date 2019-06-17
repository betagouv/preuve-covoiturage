// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';
import { Container, Exceptions } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { User } from '../entities/User';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { UserChangePasswordParamsInterface } from '../interfaces/actions/UserChangePasswordParamsInterface';

import { mockNewUserBase } from '../../tests/mocks/newUserBase';
import { mockConnectedUserBase } from '../../tests/mocks/connectedUserBase';
import { defaultUserProperties } from '../../tests/mocks/defaultUserProperties';

import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';

import { ChangePasswordUserAction } from './ChangePasswordUserAction';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
  permissions: ['profile.update'],
};

const mockUser = {
  ...mockNewUserBase,
  _id: mockConnectedUserBase._id,
};


const cryptedNewPassword = 'cryptedNewPassword';
const cryptedOldPassword = 'cryptedOldPassword';
const password = 'password';

@Container.provider()
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  async boot() {
    return;
  }

  get(key: string, fallback?: any): any {
    return;
  }
}


@Container.provider()
class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async boot(): Promise<void> {
    return;
  }
  async patch(id: string, patch: any): Promise<User> {
    return new User({
      ...mockUser,
      ...patch,
    });
  }
  async find(id: string): Promise<User> {
    return new User({
      ...mockUser,
      password: cryptedOldPassword,
    });
  }
}

@Container.provider()
class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  async comparePassword(plainPassword: string, cryptedPassword: string): Promise<boolean> {
    if (cryptedPassword === cryptedOldPassword && plainPassword === password) {
      return true;
    }
  }
  async cryptPassword(plainPassword: string): Promise<string> {
    return cryptedNewPassword;
  }
}

class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [ChangePasswordUserAction];
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

const mockChangePasswordParams = <UserChangePasswordParamsInterface>{
  oldPassword: password,
  newPassword: 'newPassword',
};

describe('USER ACTION - Change password', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.boot();
    handlers = serviceProvider.getContainer().getHandlers();
    action = serviceProvider.getContainer().getHandler(handlers[0]);
  });

  it('permission "profile.update" should change password of user', async () => {
    const result = await action.call(
      {
        method: 'user:changePassword',
        context: { call: { user: mockConnectedUser }, channel: { service: '' } },
        params: mockChangePasswordParams,
      });
    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockUser,
    });
  });

  it('wrong password should reject', async () => {
    await expect(action.call(
      {
        method: 'user:changePassword',
        context: { call: { user: mockConnectedUser }, channel: { service: '' } },
        params: {
          ...mockChangePasswordParams,
          oldPassword: 'wrongPassword',
        },
      })).to.rejectedWith(Exceptions.ForbiddenException);
  });
});

