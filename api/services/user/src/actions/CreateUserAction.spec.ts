// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { CreateUserAction } from './CreateUserAction';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const mockConnectedUser = new User({
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  aom: '1ac',
  permissions: ['user.list'],
});

const mockCreateUserParameters = {
  email: 'edouard.nelson@example.com',
  firstname: 'edouard',
  lastname: 'nelson',
  phone: '0622222233',
  group: 'registry',
  role: 'admin',
  aom: 'aomid',
  password: 'password',
};

const mockForgottenPasswordParams = {
  forgottenReset: 'randomToken',
  forgottenToken: 'randomToken2',
  forgottenAt: new Date(),
};

const mockId = '1ad';

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  public async findByEmail(email: string): Promise<User> {
    return null;
  }
  public async create(user: UserDbInterface): Promise<User> {
    return new User({ ...mockCreateUserParameters, _id: mockId, permissions: [] });
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver {}

class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
  async notify(method: string, params: any[] | { [p: string]: any }, context: Types.ContextType): Promise<void> {
    return;
  }

  async call(
    method: string,
    params: any[] | { [p: string]: any },
    context: Types.ContextType,
  ): Promise<Types.ResultType> {
    return {
      _id: mockId,
      ...mockCreateUserParameters,
      ...mockForgottenPasswordParams,
    };
  }
}

class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  get(key: string, fallback?: any): any {
    return 'https://app.covoiturage.beta.gouv.fr';
  }
}

const action = new CreateUserAction(
  new FakeUserRepository(),
  new FakeCryptoProvider(),
  new FakeConfigProvider(),
  new FakeKernelProvider(),
);

describe('Create user action', () => {
  it('should work', async () => {
    const result = await action.handle(mockCreateUserParameters, {
      call: { user: mockConnectedUser },
      channel: { service: '' },
    });

    expect(result).to.include({
      _id: mockId,
      email: mockCreateUserParameters.email,
      firstname: mockCreateUserParameters.firstname,
      lastname: mockCreateUserParameters.lastname,
      phone: mockCreateUserParameters.phone,
      group: mockCreateUserParameters.group,
      role: mockCreateUserParameters.role,
      aom: mockCreateUserParameters.aom,
      ...mockForgottenPasswordParams,
    });
  });
});
