// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { Container, Exceptions, Extensions, Interfaces, Parents } from '@ilos/core';
import { ConfigExtension } from '@ilos/config';
import { EnvExtension } from '@ilos/env';
import { ValidatorExtension } from '@pdc/provider-validator/dist';

import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { UserChangePasswordParamsInterface } from '../interfaces/actions/UserChangePasswordParamsInterface';

import { ChangePasswordUserAction } from './ChangePasswordUserAction';

import { FakeCryptoProvider, FakeKernel, FakeUserRepository } from '../../tests/providers/fakeUserProviders';

import { User } from '../entities/User';
import { mockConnectedUserBase, newPassword, password } from '../../tests/mocks/userBase';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
  permissions: ['profile.update'],
};

@Container.serviceProvider({
  env: null,
  config: {},
  providers: [FakeUserRepository, FakeCryptoProvider, FakeKernel],
  handlers: [ChangePasswordUserAction],
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

const mockChangePasswordParams = <UserChangePasswordParamsInterface>{
  newPassword,
  oldPassword: password,
};

describe('USER ACTION - Change password', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.register();
    await serviceProvider.init();
    action = serviceProvider.getContainer().get(ChangePasswordUserAction);
  });

  it('should change password of user', async () => {
    const result = await action.call({
      method: 'user:changePassword',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: mockChangePasswordParams,
    });
    expect(result).to.be.instanceof(User);
    expect(result._id).to.be.eql(mockConnectedUser._id);
    expect(result.password).to.be.eql('cryptedNewPassword');
  });

  it('wrong password should throw forbidden exception', async () => {
    await expect(
      action.call({
        method: 'user:changePassword',
        context: { call: { user: mockConnectedUser }, channel: { service: '' } },
        params: { ...mockChangePasswordParams, oldPassword: 'wrongPassword' },
      }),
    ).to.be.rejectedWith(Exceptions.ForbiddenException);
  });
});
