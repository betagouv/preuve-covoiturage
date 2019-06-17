import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Container, Exceptions, Types } from '@ilos/core';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';

import { User } from '../entities/User';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { FindUserAction } from './FindUserAction';

chai.use(chaiAsPromised);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  aom: '1ac',
  permissions: ['user.read'],
};
const mockUser = {
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  aom: '1ac',
  permissions: [],
  status: 'active',
};

@Container.provider()
class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async boot(): Promise<void> {
    return;
  }
  async findUser(id: string): Promise<User> {
    return new User(mockUser);
  }
}

@Container.provider()
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  async boot(): Promise<void> {
    return;
  }
  get(_key, fallback) {
    return fallback;
  }
}

class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [FindUserAction];
  readonly alias: any[] = [
    [ConfigProviderInterfaceResolver, FakeConfigProvider],
    [UserRepositoryProviderInterfaceResolver, FakeUserRepository],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
  ];

  protected registerConfig() {}
}

let serviceProvider;

describe('USER ACTION - FIND', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.boot();
  });

  it('should find user by id', async () => {
    const handlers = serviceProvider.getContainer().getHandlers();
    const action = serviceProvider.getContainer().getHandler(handlers[0]);
    const result = await action.call({
      method: 'user:find',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: { id: mockUser._id },
    });
    expect(result).to.eql(mockUser);
  });

  it('should throw forbidden error', async () => {
    const handlers = serviceProvider.getContainer().getHandlers();
    const action = serviceProvider.getContainer().getHandler(handlers[0]);
    await expect(action.call({
      method: 'user:find',
      context: { call: { user: { ...mockConnectedUser, permissions: [] } } , channel: { service: '' } },
      params: { id: mockUser._id },
    })).to.rejectedWith(Exceptions.ForbiddenException);
  });
});
