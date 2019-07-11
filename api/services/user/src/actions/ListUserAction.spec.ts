// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { ConfigExtension } from '@ilos/config';
import { Container, Extensions, Interfaces, Parents } from '@ilos/core';
import { EnvExtension } from '@ilos/env';
import { ValidatorExtension } from '@pdc/provider-validator/dist';

import { User } from '../entities/User';

import { defaultUserProperties } from '../../tests/mocks/defaultUserProperties';
import { mockConnectedUserBase, mockUserInDataBase } from '../../tests/mocks/userBase';
import { FakeCryptoProvider, FakeKernel, FakeUserRepository } from '../../tests/providers/fakeUserProviders';

import { CreateUserAction } from './CreateUserAction';
import { ListUserAction } from './ListUserAction';
import { PaginationInterface } from '../interfaces/PaginationInterface';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

const mockConnectedUser = {
  ...mockConnectedUserBase,
  permissions: ['user.list'],
};

const mockUsers = [new User({ ...mockUserInDataBase })];

const mockContext = {
  call: {
    user: mockConnectedUser,
    meta: {},
  },
  channel: { service: '' },
};

@Container.serviceProvider({
  env: null,
  config: {
    'user.status.notActive': 'user.status.notActive',
    'permissions.registry.admin.permissions': 'permissions.registry.admin.permissions',
    'pagination.defaultPage': 1,
    'pagination.defaultLimit': 10,
    'pagination.maxLimit': 10,
    'pagination.perPage': 25,
  },
  providers: [FakeUserRepository, FakeCryptoProvider, FakeKernel],
  handlers: [ListUserAction],
  validator: [],
})
class ServiceProvider extends Parents.ServiceProvider {
  readonly extensions: Interfaces.ExtensionStaticInterface[] = [
    EnvExtension,
    ConfigExtension,
    ValidatorExtension,
    Extensions.Providers,
  ];
}

let serviceProvider;
let action;

describe('USER ACTION  - List', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.register();
    await serviceProvider.init();
    action = serviceProvider.getContainer().get(ListUserAction);
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
    // todo: check pagination
  });
});
