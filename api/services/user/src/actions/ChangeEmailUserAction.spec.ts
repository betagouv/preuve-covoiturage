// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Container, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
import { ChangeEmailUserAction } from './ChangeEmailUserAction';
import { UserChangeEmailParamsInterface } from '../interfaces/actions/UserChangeEmailParamsInterface';
import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';
import { mockConnectedUserBase } from '../../tests/mocks/connectedUserBase';
import { mockNewUserBase } from '../../tests/mocks/newUserBase';
import { defaultUserProperties } from '../../tests/mocks/defaultUserProperties';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
  permissions: ['user.update'],
};

const mockUser = {
  ...mockNewUserBase,
};

const mockUserId = 'userId';

const mockChangeEmailParams = <UserChangeEmailParamsInterface>{
  id: mockUserId,
  email: 'newEmail@example.com',
};

@Container.provider()
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  async boot() {
    return;
  }

  get(key: string, fallback?: any): any {
    return 'https://app.covoiturage.beta.gouv.fr';
  }
}

@Container.provider()
class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
  boot() {
    return;
  }

  async notify(method: string, params: any[] | { [p: string]: any }, context: Types.ContextType): Promise<void> {
    return;
  }

  async call(
    method: string,
    params: any[] | { [p: string]: any },
    context: Types.ContextType,
  ): Promise<Types.ResultType> {
    return new User({
      ...mockUser,
      _id: mockUserId,
      email: mockChangeEmailParams.email,
    });
  }
}

@Container.provider()
class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async boot(): Promise<void> {
    return;
  }
  async patchUser(id: string, patch: any, context: any): Promise<User> {
    return new User({
      ...mockUser,
      _id: mockUserId,
      email: mockChangeEmailParams.email,
    });
  }

  async find(id: string): Promise<User> {
    return new User(mockUser);
  }
}

@Container.provider()
class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  async cryptToken(plainToken: string): Promise<string> {
    return 'cryptedToken';
  }
  generateToken(length?: number):string {
    return 'randomToken';
  }
}

class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [ChangeEmailUserAction];
  readonly alias: any[] = [
    [UserRepositoryProviderInterfaceResolver, FakeUserRepository],
    [CryptoProviderInterfaceResolver, FakeCryptoProvider],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
    [ConfigProviderInterfaceResolver, FakeConfigProvider],
    [Interfaces.KernelInterfaceResolver, FakeKernelProvider],
  ];

  protected registerConfig() {}
}

let serviceProvider;
let handlers;
let action;


describe('USER ACTION - Change email', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.boot();
    handlers = serviceProvider.getContainer().getHandlers();
    action = serviceProvider.getContainer().getHandler(handlers[0]);
  });

  it('should change email of a user', async () => {
    const result = await action.call(
      {
        method: 'user:changeEmail',
        context: { call: { user: mockConnectedUser }, channel: { service: '' } },
        params: mockChangeEmailParams,
      });
    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockUser,
      _id: mockUserId,
      email: mockChangeEmailParams.email,
    });
  });
});
