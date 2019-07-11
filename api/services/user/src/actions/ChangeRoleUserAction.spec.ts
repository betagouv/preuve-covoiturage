// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { Container, Extensions, Interfaces, Parents } from '@ilos/core';
import { ConfigExtension } from '@ilos/config';
import { EnvExtension } from '@ilos/env';
import { ValidatorExtension } from '@pdc/provider-validator/dist';

import { UserBaseInterface } from '../interfaces/UserInterfaces';

import { ChangeRoleUserAction } from './ChangeRoleUserAction';

import { mockConnectedUserBase, mockUserInDataBase } from '../../tests/mocks/userBase';
import { FakeCryptoProvider, FakeKernel, FakeUserRepository } from '../../tests/providers/fakeUserProviders';

import { User } from '../entities/User';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
  permissions: ['user.update'],
};

const newRole = 'user';

@Container.serviceProvider({
  env: null,
  config: {},
  providers: [FakeUserRepository, FakeCryptoProvider, FakeKernel],
  handlers: [ChangeRoleUserAction],
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

describe('USER ACTION - Change role', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.register();
    await serviceProvider.init();
    action = serviceProvider.getContainer().get(ChangeRoleUserAction);
  });

  // change role
  it('should change role to "user"', async () => {
    const result = await action.call({
      method: 'user:changeRole',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: { _id: mockUserInDataBase._id, role: newRole },
    });

    expect(result).to.be.instanceof(User);
    expect(result.role).to.eql(newRole);
  });

  //
  // it('permission "territory.users.update" should change role of territory user', async () => {
  //   const result = await action.call({
  //     method: 'user:changeRole',
  //     context: {
  //       call: {
  //         user: {
  //           ...mockConnectedUser,
  //           permissions: ['territory.users.update'],
  //           territory: '5d0b663b0de4f5b6e93dbca8',
  //         },
  //       },
  //       channel: { service: '' },
  //     },
  //     params: {
  //       _id: mockUser._id,
  //       role: newRole,
  //     },
  //   });
  //   expect(result).to.eql({
  //     ...defaultUserProperties,
  //     ...mockUser,
  //     role: newRole,
  //   });
  // });
});
