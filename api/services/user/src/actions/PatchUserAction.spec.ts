// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Interfaces, Types } from '@ilos/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { PatchUserAction } from './PatchUserAction';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';

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

const mockUserNewProperties = {
  firstname: 'johnny',
  lastname: 'smith',
};

const cryptedNewPassword = 'cryptedNewPassword';
const newEmail = 'newEmail@example.com';

class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
  async notify(method: string, params: any[] | { [p: string]: any }, context: Types.ContextType): Promise<void> {
    return;
  }

  async call(
    method: string,
    params: any[] | { [p: string]: any },
    context: Types.ContextType,
  ): Promise<Types.ResultType> {
    if (method === 'user:changePassword') {
      return new User({
        ...mockUser,
        password: cryptedNewPassword,
      });
    }
    if (method === 'user:changeEmail') {
      return new User({
        ...mockUser,
        email: newEmail,
      });
    }
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

const action = new PatchUserAction(new FakeKernelProvider(), new FakeUserRepository());

describe('Update name - user action', () => {
  it('should work', async () => {
    const result = await action.handle(
      { id: mockUser._id, patch: mockUserNewProperties },
      { call: { user: mockConnectedUser }, channel: { service: '' } },
    );
    expect(result).to.include({ _id: mockUser._id, ...mockUserNewProperties });
  });
});

describe('Update password - user action', () => {
  it('should work', async () => {
    const result = await action.handle(
      { id: mockUser._id, patch: { oldPassword: 'oldPassword', newPassword: 'newPassword' } },
      { call: { user: mockConnectedUser }, channel: { service: '' } },
    );
    expect(result).to.include({ _id: mockUser._id, password: cryptedNewPassword });
  });
});

describe('Update email - user action', () => {
  it('should work', async () => {
    const result = await action.handle(
      { id: mockUser._id, patch: { email: newEmail } },
      { call: { user: mockConnectedUser }, channel: { service: '' } },
    );
    expect(result).to.include({ _id: mockUser._id, email: newEmail });
  });
});
