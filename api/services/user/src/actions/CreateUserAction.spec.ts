// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Interfaces, Providers, Types } from '@pdc/core';

import { CreateUserAction } from './CreateUserAction';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserBaseInterface, UserDbInterface } from '../interfaces/UserInterfaces';

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
  permissions: [
    'user.list',
  ],
};


const mockNewUserParameters = {
  email: 'edouard.nelson@example.com',
  firstname: 'edouard',
  lastname: 'nelson',
  phone: '0622222233',
  group: 'registry',
  role: 'admin',
  aom: 'aomid',
  password: 'password',
};


const mockId = '1ab';


class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  public async findByEmail(email: string): Promise<UserDbInterface> {
    return null;
  }
  public async update(user:UserDbInterface): Promise<UserDbInterface> {
    return user;
  }
  public async create(user:UserDbInterface): Promise<UserDbInterface> {
    return { ...user, _id: mockId };
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver{

}

class FakeKernelProvider extends Interfaces.KernelInterfaceResolver{
  notify(method: string, params: any[] | { [p: string]: any }, context: Types.ContextType): Promise<void> {
    return;
  }
}

// todo: use configproviderinterfaceresolver
class FakeConfigProvider extends Providers.ConfigProvider {
  constructor(protected env: Providers.EnvProvider) {
    super(env);
  }

  get(key: string, fallback?: any): any {
    return ['user.create'];
  }
}

const envProvider = new Providers.EnvProvider();

const action = new CreateUserAction(
  new FakeUserRepository(),
  new FakeCryptoProvider(),
  new FakeConfigProvider(envProvider),
  new FakeKernelProvider());

describe('Create user action', () => {
  it('should work', async () => {
    const result = await action.handle(mockNewUserParameters,
      { call: { user: mockConnectedUser }, channel: { service: '' } });

    expect(result).to.include({
      _id: '1ab',
      email: mockNewUserParameters.email,
      firstname: mockNewUserParameters.firstname,
      lastname: mockNewUserParameters.lastname,
      phone: mockNewUserParameters.phone,
      group: mockNewUserParameters.group,
      role: mockNewUserParameters.role,
      aom: mockNewUserParameters.aom,
    });
  });
});

