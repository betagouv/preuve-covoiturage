// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { ForgottenPasswordUserAction } from './ForgottenPasswordUserAction';
import { User } from '../entities/User';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const mockConnectedUser = <UserBaseInterface>{
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  aom: '1ac',
  permissions: [],
};

const mockUser = new User({
  _id: '1ac',
  email: 'edouard.nelson@example.com',
  firstname: 'edouard',
  lastname: 'nelson',
  phone: '0622222233',
  group: 'registry',
  role: 'admin',
  aom: 'aomid',
  password: 'password',
  permissions: [],
});

const mockForgottenPasswordParams = {
  forgottenReset: 'randomToken',
  forgottenToken: 'cryptedRandomToken2',
  forgottenAt: new Date(),
};

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  public async update(user: UserBaseInterface): Promise<User> {
    return new User({
      ...mockUser,
      ...mockForgottenPasswordParams,
    });
  }
  public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
    return mockUser;
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  generateToken(length?: number) {
    return 'randomToken';
  }
  async cryptToken(plainToken: string): Promise<string> {
    return mockForgottenPasswordParams.forgottenToken;
  }
}

class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
  async call(method: string, params: any[] | { [p: string]: any }, context: Types.ContextType): Promise<Types.ResultType> {
    return undefined;
  }
}

class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  get(key: string, fallback?: any): any {
    return 'https://app.covoiturage.beta.gouv.fr';
  }
}

const action = new ForgottenPasswordUserAction(
  new FakeUserRepository(),
  new FakeCryptoProvider(),
  new FakeConfigProvider(),
  new FakeKernelProvider(),
);

describe('USER ACTION - Forgotten password', () => {
  it('should update user properties', async () => {
    const result = await action.handle(
      { email: mockUser.email },
      { call: { user: mockConnectedUser }, channel: { service: '' } },
    );
    expect(result).to.equal(undefined);
  });
});
