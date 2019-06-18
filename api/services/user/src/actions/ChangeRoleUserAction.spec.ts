// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { Container, Exceptions } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';

import { User } from '../entities/User';

import { ChangeRoleUserAction } from './ChangeRoleUserAction';

import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';

import { mockConnectedUserBase } from '../../tests/mocks/connectedUserBase';
import { mockId, mockNewUserBase } from '../../tests/mocks/newUserBase';
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
  role: 'admin',
  _id: '5d08a67dea858e4bd08964d3',
};

const newRole = 'user';

@Container.provider()
class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async boot() {
    return;
  }
  async patchUser(id: string, patch: any): Promise<User> {
    return new User({
      ...mockUser,
      ...patch,
    });
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

class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [ChangeRoleUserAction];
  readonly alias: any[] = [
    [ConfigProviderInterfaceResolver, FakeConfigProvider],
    [UserRepositoryProviderInterfaceResolver, FakeUserRepository],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
  ];

  protected registerConfig() {}
}

let serviceProvider;
let handlers;
let action;

describe('USER ACTION - Change role', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.boot();
    handlers = serviceProvider.getContainer().getHandlers();
    action = serviceProvider.getContainer().getHandler(handlers[0]);
  });

  it('permission "user.update" - should change role to "user"', async () => {
    const result = await action.call({
      method: 'user:changeRole',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: { id: mockUser._id, role: newRole },
    });
    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockUser,
      role: newRole,
    });
  });

  it('permission "aom.users.update" should change role of aom user', async () => {
    const result = await action.call({
      method: 'user:changeRole',
      context: {
        call: {
          user: {
            ...mockConnectedUser,
            permissions: ['aom.users.update'],
            aom: 'aomId',
          },
        },
        channel: { service: '' },
      },
      params: {
        id: mockUser._id,
        role: newRole,
      },
    });
    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockUser,
      role: newRole,
    });
  });
});
