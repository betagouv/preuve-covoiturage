// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ConfigExtension } from '@ilos/config';
import { Container, Exceptions, Extensions, Interfaces, Parents } from '@ilos/core';
import { EnvExtension } from '@ilos/env';
import { ValidatorExtension } from '@pdc/provider-validator/dist';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserResetPasswordParamsInterface } from '../interfaces/actions/UserResetPasswordParamsInterface';
import { ResetPasswordUserAction } from './ResetPasswordUserAction';

import { User } from '../entities/User';

import { FakeKernel, FakeUserRepository } from '../../tests/providers/fakeUserProviders';
import { mockUserBase, newPassword } from '../../tests/mocks/userBase';

chai.use(chaiAsPromised);
const { expect } = chai;

const mockResetPasswordParams = <UserResetPasswordParamsInterface>{
  token: mockUserBase.forgottenToken,
  reset: mockUserBase.forgottenReset,
  password: newPassword,
};

@Container.provider({
  identifier: CryptoProviderInterfaceResolver,
})
class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  async compareForgottenToken(plainToken: string, cryptedToken: string): Promise<boolean> {
    return plainToken === mockResetPasswordParams.token && cryptedToken === mockUserBase.forgottenToken;
  }
  async cryptPassword(plainPassword: string): Promise<string> {
    return 'cryptedNewPassword';
  }
}

@Container.serviceProvider({
  env: null,
  config: {
    'user.tokenExpiration.passwordReset': 68600,
    'user.status.active': 'active',
  },
  providers: [FakeUserRepository, FakeCryptoProvider, FakeKernel],
  handlers: [ResetPasswordUserAction],
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

describe('USER ACTION - Reset password', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.register();
    await serviceProvider.init();
    action = serviceProvider.getContainer().get(ResetPasswordUserAction);
  });
  it('should work', async () => {
    const result = await action.call({
      method: 'user:resetPassword',
      context: { call: { user: {}, channel: { service: '' } } },
      params: mockResetPasswordParams,
    });
    expect(result).to.be.instanceof(User);
    expect(result.status).to.be.eql('active');
  });
  it('wrong token should throw forbidden error', async () => {
    await expect(
      action.call({
        method: 'user:resetPassword',
        context: { call: { user: {}, channel: { service: '' } } },
        params: { ...mockResetPasswordParams, token: 'EhWDV9WbltMgD6hQblL6jleDk1Uwrong' },
      }),
    ).to.be.rejectedWith(Exceptions.ForbiddenException);
  });
});
