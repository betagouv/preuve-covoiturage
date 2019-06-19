// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { Container, Interfaces } from '@ilos/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { DeleteUserAction } from './DeleteUserAction';
import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';

import { mockConnectedUserBase } from '../../tests/mocks/connectedUserBase';
import { mockNewUserBase } from '../../tests/mocks/newUserBase';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
  permissions: ['user.delete'],
};

const mockUser = {
  ...mockNewUserBase,
  _id: '5d08a5746024760031b33629',
};

@Container.provider()
class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async boot() {
    return;
  }
  async deleteUser(_id: string): Promise<any> {
    return;
  }
}

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
class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [DeleteUserAction];
  readonly alias: any[] = [
    [ConfigProviderInterfaceResolver, FakeConfigProvider],
    [UserRepositoryProviderInterfaceResolver, FakeUserRepository],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
  ];

  protected registerConfig() {}

  protected registerTemplate() {}
}

let serviceProvider;
let handlers;
let action;

describe('USER ACTION - Delete user', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.boot();
    handlers = serviceProvider.getContainer().getHandlers();
    action = serviceProvider.getContainer().getHandler(handlers[0]);
  });
  it('permission "user.delete" should delete user', async () => {
    const result = await action.call({
      method: 'user:delete',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: { id: mockUser._id },
    });
    expect(result).to.equal(undefined);
  });
  it('permission "profile.delete" should delete his profile', async () => {
    const result = await action.call({
      method: 'user:delete',
      context: {
        call: {
          user: {
            ...mockConnectedUser,
            id: mockUser._id,
          },
        },
        channel: { service: '' },
      },
      params: { id: mockUser._id },
    });
    expect(result).to.equal(undefined);
  });
  it('permission "aom.users.remove" should delete aom user', async () => {
    const result = await action.call({
      method: 'user:delete',
      context: {
        call: {
          user: {
            ...mockConnectedUser,
            aom: 'aomId',
          },
        },
        channel: { service: '' },
      },
      params: {
        id: mockUser._id,
      },
    });
    expect(result).to.equal(undefined);
  });
});
