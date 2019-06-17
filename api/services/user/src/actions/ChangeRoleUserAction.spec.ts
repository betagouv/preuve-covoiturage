// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Interfaces, Types } from '@ilos/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { PatchUserAction } from './PatchUserAction';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
import { ChangeRoleUserAction } from './ChangeRoleUserAction';

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
  permissions: ['user.list'],
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
  permissions: ['user.list'],
});

const newRole = 'user';

class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
  async notify(method: string, params: any[] | { [p: string]: any }, context: Types.ContextType): Promise<void> {
    return;
  }
}

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async patchUser(id: string, patch: any): Promise<User> {
    return new User({
      _id: id,
      ...patch,
    });
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver {}

const action = new ChangeRoleUserAction(new FakeKernelProvider(), new FakeUserRepository());

describe('USER ACTION - update role', () => {
  it('should change role to user', async () => {
    const result = await action.handle(
      { id: mockUser._id, role: newRole },
      { call: { user: mockConnectedUser }, channel: { service: '' } },
    );
    expect(result).to.include({ _id: mockUser._id, role: newRole  });
  });
});

