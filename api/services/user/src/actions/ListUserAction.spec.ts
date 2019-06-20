// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { Container, Interfaces } from '@ilos/core';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { ListUserAction } from './ListUserAction';
import { User } from '../entities/User';
import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { mockConnectedUserBase } from '../../tests/mocks/connectedUserBase';
import { mockNewUserBase } from '../../tests/mocks/newUserBase';
import { defaultUserProperties } from '../../tests/mocks/defaultUserProperties';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
  permissions: ['user.list'],
};

const mockUsers = [{ ...mockNewUserBase, _id: 'mockUserId' }];

const mockOutputPagination = {
  total: 1,
  count: 1,
  per_page: 25,
  current_page: 1,
  total_pages: 1,
};

const mockContext = {
  call: {
    user: mockConnectedUser,
    metadata: {},
  },
  channel: { service: '' },
};

@Container.provider()
class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async boot() {
    return;
  }
  async list(filters, pagination): Promise<any> {
    return { users: [new User(mockUsers[0])], total: mockOutputPagination.total, count: mockOutputPagination.count };
  }
}

@Container.provider()
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  async boot() {
    return;
  }
  get(key: string, fallback?: any): any {
    return ['user.list'];
  }
}

class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [ListUserAction];
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

describe('USER ACTION  - List', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.boot();
    handlers = serviceProvider.getContainer().getHandlers();
    action = serviceProvider.getContainer().getHandler(handlers[0]);
  });
  it('should work return users', async () => {
    const result = await action.call({
      method: 'user:list',
      context: mockContext,
      params: {},
    });
    expect(result.data[0]).to.eql({
      ...defaultUserProperties,
      ...mockUsers[0],
    });
  });
});
