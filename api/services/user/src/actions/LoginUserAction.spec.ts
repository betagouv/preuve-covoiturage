// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ConfigExtension } from '@ilos/config';
import { Container, Exceptions, Extensions, Interfaces, Parents } from '@ilos/core';
import { EnvExtension } from '@ilos/env';
import { ValidatorExtension } from '@pdc/provider-validator';

import { LoginUserAction } from './LoginUserAction';

import { UserLoginParamsInterface } from '../interfaces/actions/UserLoginParamsInterface';

import { FakeCryptoProvider, FakeKernel, FakeUserRepository } from '../../tests/providers/fakeUserProviders';
import { mockUserBase, password } from '../../tests/mocks/userBase';
import { User } from '../entities/User';

chai.use(chaiAsPromised);
const { expect } = chai;

const mockUser = { ...mockUserBase, status: 'active' };

const mockLoginParams = <UserLoginParamsInterface>{
  password,
  email: mockUser.email,
};

@Container.serviceProvider({
  env: null,
  config: {
    'user.status.active': 'active',
  },
  providers: [FakeUserRepository, FakeCryptoProvider, FakeKernel],
  handlers: [LoginUserAction],
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

describe('USER ACTION - Login', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.register();
    await serviceProvider.init();
    action = serviceProvider.getContainer().get(LoginUserAction);
  });
  it('should login with correct email & pwd', async () => {
    const result = await action.call({
      method: 'user:login',
      context: { call: { user: {} }, channel: { service: '' } },
      params: mockLoginParams,
    });
    expect(result).to.be.instanceof(User);
  });

  it('wrong password should throw forbidden exception', async () => {
    await expect(
      action.call({
        method: 'user:login',
        context: { call: { user: {} }, channel: { service: '' } },
        params: { ...mockLoginParams, password: 'wrongPassword' },
      }),
    ).to.be.rejectedWith(Exceptions.ForbiddenException);
  });
});
