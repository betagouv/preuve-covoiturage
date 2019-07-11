// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Container, Exceptions, Extensions, Interfaces, Parents } from '@ilos/core';
import { EnvExtension } from '@ilos/env';
import { ConfigExtension } from '@ilos/config';
import { ValidatorExtension } from '@pdc/provider-validator/dist';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserConfirmEmailParamsInterface } from '../interfaces/actions/UserConfirmEmailParamsInterface';
import { FakeKernel, FakeUserRepository } from '../../tests/providers/fakeUserProviders';
import { ConfirmEmailUserAction } from './ConfirmEmailUserAction';
import { User } from '../entities/User';
import { mockUserInDataBase } from '../../tests/mocks/userBase';

chai.use(chaiAsPromised);
const { expect } = chai;

const mockResetPasswordParams = <UserConfirmEmailParamsInterface>{
  token: mockUserInDataBase.emailToken,
  confirm: mockUserInDataBase.emailConfirm,
};

@Container.provider({
  identifier: CryptoProviderInterfaceResolver,
})
class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  async compareForgottenToken(plainToken: string, cryptedToken: string): Promise<boolean> {
    if (plainToken === mockResetPasswordParams.token && cryptedToken === mockUserInDataBase.emailToken) {
      return true;
    }
    return false;
  }
}

@Container.serviceProvider({
  env: null,
  config: {
    'user.tokenExpiration.emailConfirm': 86400,
    'user.status.active': 'active',
  },
  providers: [FakeUserRepository, FakeCryptoProvider, FakeKernel],
  handlers: [ConfirmEmailUserAction],
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

describe('USER ACTION - Confirm email', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.register();
    await serviceProvider.init();
    action = serviceProvider.getContainer().get(ConfirmEmailUserAction);
  });

  // works
  it('should change status to active', async () => {
    const result = await action.call({
      method: 'user:confirmEmail',
      context: { call: { user: {} }, channel: { service: '' } },
      params: mockResetPasswordParams,
    });

    expect(result).to.be.instanceof(User);
    expect(result.status).to.eql('active');
  });

  // wrong token
  it('wrong token should reject with forbidden', async () => {
    await expect(
      action.call({
        method: 'user:confirmEmail',
        context: { call: { user: {} }, channel: { service: '' } },
        params: { ...mockResetPasswordParams, token: 'W0mn7FUNQI53qAaKW8lxIiTB9bG0WRONG' },
      }),
    ).to.be.rejectedWith(Exceptions.ForbiddenException);
  });
});
