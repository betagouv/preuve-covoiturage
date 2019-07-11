// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Container, Exceptions, Extensions, Interfaces, Parents, Types } from '@ilos/core';
import { ConfigExtension, ConfigInterfaceResolver } from '@ilos/config';
import { EnvExtension } from '@ilos/env';
import { ValidatorExtension } from '@pdc/provider-validator/dist';

import { CreateUserAction } from './CreateUserAction';
import { UserBaseInterface, UserInterface } from '../interfaces/UserInterfaces';
import { mockConnectedUserBase, mockCreateUserParams, mockUserInDataBase } from '../../tests/mocks/userBase';
import { FakeCryptoProvider, FakeKernel, FakeUserRepository } from '../../tests/providers/fakeUserProviders';
import { User } from '../entities/User';

chai.use(chaiAsPromised);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
  permissions: ['user.create'],
};

@Container.serviceProvider({
  env: null,
  config: {
    'user.status.notActive': 'noActive',
    'permissions.registry.admin.permissions': 'permissions.registry.admin.permissions',
    'email.templates.invite': 'email.templates.invite',
    'url.appUrl': 'url.appUrl',
  },
  providers: [FakeUserRepository, FakeCryptoProvider, FakeKernel],
  handlers: [CreateUserAction],
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

describe('USER ACTION  - Create user', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.register();
    await serviceProvider.init();
    action = serviceProvider.getContainer().get(CreateUserAction);
  });

  it('should return new user', async () => {
    const result = await action.call({
      method: 'user:createUser',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: { ...mockCreateUserParams, email: 'newemail@example.com' },
    });

    expect(result).to.be.instanceof(User);
    expect(result._id).to.be.eql(mockUserInDataBase._id);
    expect(result.email).to.be.eql('newemail@example.com');
  });

  it('existing email should return conflit error', async () => {
    await expect(
      action.call({
        method: 'user:createUser',
        context: { call: { user: mockConnectedUser }, channel: { service: '' } },
        params: mockCreateUserParams,
      }),
    ).to.be.rejectedWith(Exceptions.ConflictException);
  });

  // it('permission "territory.users.add" should return new user', async () => {
  //   const result = await action.call({
  //     method: 'user:createUser',
  //     context: {
  //       call: {
  //         user: {
  //           ...mockConnectedUser,
  //           permissions: ['territory.users.add'],
  //           territory: '5d08a77ae2b965a487be64a4',
  //         },
  //       },
  //       channel: { service: '' },
  //     },
  //     params: {
  //       ...mockCreateUserParams,
  //       territory: '5d08a77ae2b965a487be64a4',
  //     },
  //   });
  //
  //   expect(result).to.eql({
  //     ...defaultUserProperties,
  //     ...mockNewUser,
  //     _id: mockNewUserId,
  //   });
  // });
  //
  // it('permission "territory.users.add" shouldn\'t create user from other territory - reject forbidden', async () => {
  //   await expect(
  //     action.call({
  //       method: 'user:createUser',
  //       context: {
  //         call: {
  //           user: {
  //             ...mockConnectedUser,
  //             permissions: ['territory.users.add'],
  //             territory: '5d08a77ae2b965a487be64a4',
  //           },
  //         },
  //         channel: { service: '' },
  //       },
  //       params: {
  //         ...mockCreateUserParams,
  //         territory: '5d08a784a197afe4692da7f1',
  //       },
  //     }),
  //   ).to.rejectedWith(Exceptions.ForbiddenException);
  // });
});
