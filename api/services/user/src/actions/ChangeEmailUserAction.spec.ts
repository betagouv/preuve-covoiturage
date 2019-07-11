// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { Container, Exceptions, Extensions, Interfaces, Parents } from '@ilos/core';
import { EnvExtension } from '@ilos/env';
import { ConfigExtension } from '@ilos/config';
import { ValidatorExtension } from '@pdc/provider-validator';

import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { UserChangeEmailParamsInterface } from '../interfaces/actions/UserChangeEmailParamsInterface';

import { ChangeEmailUserAction } from './ChangeEmailUserAction';

import { FakeCryptoProvider, FakeKernel, FakeUserRepository } from '../../tests/providers/fakeUserProviders';
import { mockConnectedUserBase, mockUserBase } from '../../tests/mocks/userBase';

import { User } from '../entities/User';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
  permissions: ['user.update'],
};

const mockChangeEmailParams = <UserChangeEmailParamsInterface>{
  _id: mockUserBase._id,
  email: 'newEmail@example.com',
};

@Container.serviceProvider({
  env: null,
  config: {
    'user.status.notActive': 'user.status.notActive',
    'email.templates.confirm': 'email.templates.confirm',
    'url.appUrl': 'url.appUrl',
  },
  providers: [FakeUserRepository, FakeCryptoProvider, FakeKernel],
  handlers: [ChangeEmailUserAction],
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

describe('USER ACTION - Change email', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.register();
    await serviceProvider.init();
    action = serviceProvider.getContainer().get(ChangeEmailUserAction);
  });

  // found
  it('should change email of a user', async () => {
    const result = await action.call({
      method: 'user:changeEmail',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: mockChangeEmailParams,
    });
    expect(result).to.be.instanceof(User);
    expect(result._id).to.eql(mockUserBase._id);
    expect(result.status).to.eql('user.status.notActive');
  });

  // it('permission "user.update" should change email of a user', async () => {
  //   const result = await action.call({
  //     method: 'user:changeEmail',
  //     context: { call: { user: mockConnectedUser }, channel: { service: '' } },
  //     params: mockChangeEmailParams,
  //   });
  //   expect(result).to.eql({
  //     ...defaultUserProperties,
  //     ...mockUser,
  //     _id: mockId,
  //     email: mockChangeEmailParams.email,
  //   });
  // });
  //
  // it('permission "profile.update" should change email of his profile', async () => {
  //   mockConnectedUser.permissions = ['profile.update'];
  //   mockConnectedUser._id = mockId;
  //   const result = await action.call({
  //     method: 'user:changeEmail',
  //     context: { call: { user: mockConnectedUser }, channel: { service: '' } },
  //     params: mockChangeEmailParams,
  //   });
  //   expect(result).to.eql({
  //     ...defaultUserProperties,
  //     ...mockUser,
  //     _id: mockId,
  //     email: mockChangeEmailParams.email,
  //   });
  // });
  //
  // it('permission "profile.update" shouldn\'t change email of other profile - reject with forbidden', async () => {
  //   mockConnectedUser.permissions = ['profile.update'];
  //   mockConnectedUser._id = '5d0b7d6d6e9dbf942cbaf7cb';
  //   await expect(
  //     action.call({
  //       method: 'user:changeEmail',
  //       context: { call: { user: mockConnectedUser }, channel: { service: '' } },
  //       params: mockChangeEmailParams,
  //     }),
  //   ).to.rejectedWith(Exceptions.ForbiddenException);
  // });
  //
  // it('permission "territory.users.update" should change email of territory user', async () => {
  //   mockConnectedUser.permissions = ['profile.update'];
  //   mockConnectedUser.territory = '5d0b7d6642eec5d400231790';
  //   mockUser['territory'] = mockConnectedUser.territory;
  //   mockConnectedUser._id = mockId;
  //   const result = await action.call({
  //     method: 'user:changeEmail',
  //     context: { call: { user: mockConnectedUser }, channel: { service: '' } },
  //     params: mockChangeEmailParams,
  //   });
  //   expect(result).to.eql({
  //     ...defaultUserProperties,
  //     ...mockUser,
  //     _id: mockId,
  //     email: mockChangeEmailParams.email,
  //   });
  // });
});
