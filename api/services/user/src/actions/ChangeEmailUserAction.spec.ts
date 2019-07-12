// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { Container, Exceptions, Extensions, Interfaces, Parents } from '@ilos/core';
import { EnvExtension } from '@ilos/env';
import { ConfigExtension } from '@ilos/config';
import { ValidatorExtension } from '@pdc/provider-validator';

import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { UserChangeEmailParamsInterface } from '../interfaces/actions/UserChangeEmailParamsInterface';

import { ChangeEmailUserAction } from './ChangeEmailUserAction';

import { FakeCryptoProvider, FakeKernel, FakeUserRepository } from '../../tests/providers/fakeUserProviders';
import { mockConnectedUserBase, mockUserInDataBase } from '../../tests/mocks/userBase';

import { User } from '../entities/User';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
  permissions: ['user.update'],
};

const mockChangeEmailParams = <UserChangeEmailParamsInterface>{
  _id: mockUserInDataBase._id,
  email: 'newEmail@example.com',
};

@Container.serviceProvider({
  env: null,
  config: {
    'user.status.notActive': 'user.status.notActive',
    'email.templates.confirm': 'email.templates.confirm',
    'url.appUrl': 'url.appUrl',
  },
  providers: [FakeUserRepository, FakeCryptoProvider, FakeKernel],
  handlers: [ChangeEmailUserAction],
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

describe('USER ACTION - Change email', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.register();
    await serviceProvider.init();
    action = serviceProvider.getContainer().get(ChangeEmailUserAction);
  });

  // found
  it('should change email of a user', async () => {
    const result = await action.call({
      method: 'user:changeEmail',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: mockChangeEmailParams,
    });
    expect(result).to.be.instanceof(User);
    expect(result._id).to.eql(mockUserInDataBase._id);
    expect(result.status).to.eql('user.status.notActive');
  });
});
