// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { Container, Exceptions } from '@ilos/core';

import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { UserChangeEmailParamsInterface } from '../interfaces/actions/UserChangeEmailParamsInterface';

import { ChangeEmailUserAction } from './ChangeEmailUserAction';

import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';

import { mockConnectedUserBase } from '../../tests/mocks/connectedUserBase';
import { mockNewUserBase } from '../../tests/mocks/newUserBase';
import { defaultUserProperties } from '../../tests/mocks/defaultUserProperties';
import {
  FakeConfigProvider,
  FakeCryptoProvider,
  FakeKernelProvider,
  FakeUserRepository,
} from '../../tests/providers/fakeUserProviders';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
  permissions: ['user.update'],
};

const mockUser = {
  ...mockNewUserBase,
};

const mockUserId = '5d08a3d4b9cf27edc29ee830';

const mockChangeEmailParams = <UserChangeEmailParamsInterface>{
  _id: mockUserId,
  email: 'newEmail@example.com',
};

@Container.serviceProvider({
  providers: [FakeUserRepository, FakeCryptoProvider, FakeConfigProvider, FakeKernelProvider],
  handlers: [ChangeEmailUserAction],
})
class ServiceProvider extends BaseServiceProvider {}

let serviceProvider;
let handlers;
let action;

describe('USER ACTION - Change email', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.init();
    action = serviceProvider.getContainer().getHandler(ChangeEmailUserAction);
    // action = serviceProvider.getContainer().getHandler(handlers[0]);
  });

  it('permission "user.update" should change email of a user', async () => {
    const result = await action.call({
      method: 'user:changeEmail',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: mockChangeEmailParams,
    });
    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockUser,
      _id: mockUserId,
      email: mockChangeEmailParams.email,
    });
  });

  it('permission "profile.update" should change email of his profile', async () => {
    mockConnectedUser.permissions = ['profile.update'];
    mockConnectedUser._id = mockUserId;
    const result = await action.call({
      method: 'user:changeEmail',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: mockChangeEmailParams,
    });
    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockUser,
      _id: mockUserId,
      email: mockChangeEmailParams.email,
    });
  });

  it('permission "profile.update" shouldn\'t change email of other profile - reject with forbidden', async () => {
    mockConnectedUser.permissions = ['profile.update'];
    mockConnectedUser._id = '5d0b7d6d6e9dbf942cbaf7cb';
    await expect(
      action.call({
        method: 'user:changeEmail',
        context: { call: { user: mockConnectedUser }, channel: { service: '' } },
        params: mockChangeEmailParams,
      }),
    ).to.rejectedWith(Exceptions.ForbiddenException);
  });

  it('permission "territory.users.update" should change email of territory user', async () => {
    mockConnectedUser.permissions = ['profile.update'];
    mockConnectedUser.territory = '5d0b7d6642eec5d400231790';
    mockUser['territory'] = mockConnectedUser.territory;
    mockConnectedUser._id = mockUserId;
    const result = await action.call({
      method: 'user:changeEmail',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: mockChangeEmailParams,
    });
    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockUser,
      _id: mockUserId,
      email: mockChangeEmailParams.email,
    });
  });
});
