// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Container, Exceptions, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';

import { CreateUserAction } from './CreateUserAction';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';

import { User } from '../entities/User';

import { mockConnectedUserBase } from '../../tests/mocks/connectedUserBase';
import { mockNewUserBase } from '../../tests/mocks/newUserBase';

import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';
import { defaultUserProperties } from '../../tests/mocks/defaultUserProperties';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
  permissions: ['user.create'],
};

const mockNewUser = {
  ...mockNewUserBase,
};

const mockCreateUserParams = {
  ...mockNewUser,
};

delete mockCreateUserParams.permissions;

const mockNewUserId = '5d08a59aeb5e79d7607d29cd';

@Container.provider()
class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async boot() {
    return;
  }
  public async create(user: UserBaseInterface): Promise<User> {
    return new User({ ...mockNewUser, _id: mockNewUserId });
  }
  public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
    return null;
  }
  async update(user: any): Promise<User> {
    return user;
  }
}

@Container.provider()
class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  generateToken(): string {
    const list = [
      'zHeJha04jbHdEG0FC6jhtKuPnCbiccd3',
      'Nwle5ibspKzQbl32b53RAC1GWm9ZRKFK',
      'd6QmpInknZudoFmRyy6pX9Z0apeCGTpK',
      '8jLAY83TMcZ01Z7QsEyeS25WlZaS5xKC',
    ];

    return list[Math.floor(Math.random() * list.length)];
  }
  async cryptToken(plainToken: string): Promise<string> {
    return 'cryptedToken';
  }
}

@Container.provider()
class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
  async boot() {
    return;
  }
  async call(
    method: string,
    params: any[] | { [p: string]: any },
    context: Types.ContextType,
  ): Promise<Types.ResultType> {
    return undefined;
  }
}

@Container.provider()
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  async boot() {
    return;
  }
  get(key: string, fallback?: any): any {
    if (key === 'user.status.notActive') {
      return 'notActive';
    }
    return 'https://app.covoiturage.beta.gouv.fr';
  }
}

class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [CreateUserAction];
  readonly alias: any[] = [
    [ConfigProviderInterfaceResolver, FakeConfigProvider],
    [CryptoProviderInterfaceResolver, FakeCryptoProvider],
    [Interfaces.KernelInterfaceResolver, FakeKernelProvider],
    [UserRepositoryProviderInterfaceResolver, FakeUserRepository],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
  ];

  protected registerConfig() {}

  protected registerTemplate() {}
}

let serviceProvider;
let handlers;
let action;

describe('USER ACTION  - Create user', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.boot();
    handlers = serviceProvider.getContainer().getHandlers();
    action = serviceProvider.getContainer().getHandler(handlers[0]);
  });

  it('permission "user.create" should return new user with ', async () => {
    const result = await action.call({
      method: 'user:createUser',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: mockCreateUserParams,
    });

    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockNewUser,
      _id: mockNewUserId,
    });
  });

  it('permission "aom.users.add" should return new user', async () => {
    const result = await action.call({
      method: 'user:createUser',
      context: {
        call: {
          user: {
            ...mockConnectedUser,
            permissions: ['aom.users.add'],
            aom: '5d08a77ae2b965a487be64a4',
          },
        },
        channel: { service: '' },
      },
      params: {
        ...mockCreateUserParams,
        aom: '5d08a77ae2b965a487be64a4',
      },
    });

    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockNewUser,
      _id: mockNewUserId,
    });
  });

  it('permission "aom.users.add" shouldn\'t create user from other aom - reject forbidden', async () => {
    await expect(
      action.call({
        method: 'user:createUser',
        context: {
          call: {
            user: {
              ...mockConnectedUser,
              permissions: ['aom.users.add'],
              aom: '5d08a77ae2b965a487be64a4',
            },
          },
          channel: { service: '' },
        },
        params: {
          ...mockCreateUserParams,
          aom: '5d08a784a197afe4692da7f1',
        },
      }),
    ).to.rejectedWith(Exceptions.ForbiddenException);
  });
});
