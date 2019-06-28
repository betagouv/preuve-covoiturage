// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { describe } from 'mocha';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Container, Exceptions } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { PatchUserAction } from './PatchUserAction';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
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
  _id: '5d07f9c61cf0b9ce019da281',
};

const mockUserNewProperties = {
  firstname: 'johnny',
  lastname: 'smith',
};

@Container.provider()
class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async patchUser(_id: string, patch: any, contextParams: any): Promise<User> {
    return new User({
      _id,
      ...mockUser,
      ...patch,
    });
  }
}

@Container.provider()
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  get(key: string, fallback?: any): any {
    return;
  }
}

@Container.provider()
class FakeCryptoProvider extends CryptoProviderInterfaceResolver {}

class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [PatchUserAction];
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

describe('USER ACTION - Patch', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.boot();
    handlers = serviceProvider.getContainer().getHandlers();
    action = serviceProvider.getContainer().getHandler(handlers[0]);
  });

  it('should change firstname & lastname', async () => {
    const result = await action.call({
      method: 'user:patch',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: { _id: mockUser._id, patch: mockUserNewProperties },
    });
    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockUser,
      ...mockUserNewProperties,
    });
  });

  it('should raise error if data not valid', async () => {
    expect(
      action.call({
        method: 'user:patch',
        context: { call: { user: mockConnectedUser }, channel: { service: '' } },
        params: { _id: mockUser._id, patch: {} },
      }),
    ).to.be.rejectedWith(Exceptions.InvalidParamsException);
  });

  it("shouldn't change role", async () => {
    await expect(
      action.call({
        method: 'user:patch',
        context: { call: { user: mockConnectedUser }, channel: { service: '' } },
        params: { _id: mockUser._id, patch: { role: 'user' } },
      }),
    ).to.rejectedWith(Exceptions.InvalidParamsException);
  });
});
