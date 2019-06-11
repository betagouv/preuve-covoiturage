// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Interfaces, Providers, Types } from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
import { ChangePasswordUserAction } from './ChangePasswordUserAction';
import { ChangeEmailUserAction, ChangeEmailUserInterface } from './ChangeEmailUserAction';


chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;


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

const mockUser = new User({
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
});

const mockChangeEmailParams = <ChangeEmailUserInterface>{
  id: '1ab',
  email: 'newEmail@example.com',
};

// todo: use configproviderinterfaceresolver
class FakeConfigProvider extends Providers.ConfigProvider {
  constructor(protected env: Providers.EnvProvider) {
    super(env);
  }

  get(key: string, fallback?: any): any {
    return 'https://app.covoiturage.beta.gouv.fr';
  }
}

const envProvider = new Providers.EnvProvider();

class FakeKernelProvider extends Interfaces.KernelInterfaceResolver{
  async notify(method: string, params: any[] | { [p: string]: any }, context: Types.ContextType): Promise<void> {
    return;
  }

  async call(method: string, params: any[] | { [p: string]: any },
             context: Types.ContextType): Promise<Types.ResultType> {
    return {
      ...mockUser,
      email: mockChangeEmailParams.email,
    };
  }
}

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async patch(id: string, patch: any): Promise<User> {
    return new User({
      ...mockUser,
      email: mockChangeEmailParams.email,
    });
  }
  async find(id: string): Promise<User> {
    return mockUser;
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  async comparePassword(oldPwd:string, newPwd:string): Promise<boolean> {
    return true;
  }
}

const action = new ChangeEmailUserAction(
  new FakeConfigProvider(envProvider),
  new FakeCryptoProvider(),
  new FakeKernelProvider(),
  new FakeUserRepository(),
);


describe('Change email - user action', () => {
  it('should work', async () => {
    const result = await action.handle(
      mockChangeEmailParams,
      { call: { user: mockConnectedUser } , channel: { service: '' } });

    expect(result).to.include({ email:  mockChangeEmailParams.email });
  });
});

