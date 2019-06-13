// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserBaseInterface, UserDbInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
import { InviteUserAction } from './InviteUserAction';

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

const mockInviteParams = {
  forgottenReset: 'randomToken',
  forgottenToken: 'cryptedRandomToken2',
  forgottenAt: new Date(),
};

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async find(id: string): Promise<User> {
    return mockUser;
  }
  public async update(user: UserDbInterface): Promise<User> {
    return new User({
      ...mockUser,
      ...mockInviteParams,
    });
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  generateToken(length?: number) {
    return 'randomToken';
  }
  async cryptToken(plainToken: string): Promise<string> {
    return mockInviteParams.forgottenToken;
  }
}

class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
  async notify(method: string, params: any[] | { [p: string]: any }, context: Types.ContextType): Promise<void> {
    return;
  }
}

class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  get(key: string, fallback?: any): any {
    return 'https://app.covoiturage.beta.gouv.fr';
  }
}

const action = new InviteUserAction(
  new FakeUserRepository(),
  new FakeCryptoProvider(),
  new FakeConfigProvider(),
  new FakeKernelProvider(),
);

describe('Invite action', () => {
  it('should work', async () => {
    const result = await action.handle(
      { id: mockUser._id },
      { call: { user: mockConnectedUser }, channel: { service: '' } },
    );

    expect(result).to.include({
      ...mockInviteParams,
    });
  });
});
