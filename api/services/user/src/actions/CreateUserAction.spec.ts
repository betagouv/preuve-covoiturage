// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { CreateUserAction } from './CreateUserAction';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
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
};

const mockId = '1ad';

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  public async create(user: UserBaseInterface): Promise<User> {
    return new User({ ...mockCreateUserParameters, _id: mockId, permissions: [] });
  }
  public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
    return null;
  }
  async update(user: any): Promise<User> {
    return user;
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  generateToken(length?: number) {
    return 'randomToken';
  }
  async cryptToken(plainToken: string): Promise<string> {
    return 'cryptedToken';
  }
}

class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
  async call(method: string, params: any[] | { [p: string]: any }, context: Types.ContextType): Promise<Types.ResultType> {
    return undefined;
  }
}

class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  get(key: string, fallback?: any): any {
    if (key === 'user.status.notActive') {
      return 'notActive';
    }
    return 'https://app.covoiturage.beta.gouv.fr';
  }
}

const action = new CreateUserAction(
  new FakeUserRepository(),
  new FakeCryptoProvider(),
  new FakeConfigProvider(),
  new FakeKernelProvider(),
);

describe('USER ACTION  - Create user', () => {
  it('should work', async () => {
    const result = await action.handle(mockCreateUserParameters, {
      call: { user: mockConnectedUser },
      channel: { service: '' },
    });

    expect(result).to.include({
      _id: mockId,
      ...mockCreateUserParameters
    });
  });
});
