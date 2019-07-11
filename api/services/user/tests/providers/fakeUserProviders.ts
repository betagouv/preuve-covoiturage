// tslint:disable max-classes-per-file
import { Container, Interfaces, Types } from '@ilos/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { ConfigInterfaceResolver } from '@ilos/config';

import { UserRepositoryProviderInterfaceResolver } from '../../src/interfaces/repository/UserRepositoryProviderInterface';
import { User } from '../../src/entities/User';
import { mockCreateUserParams, mockUserInDataBase, password } from '../mocks/userBase';
import { UserInterface } from '../../src/interfaces/UserInterfaces';
import { mockOutputPagination } from '../mocks/pagination';

@Container.provider({
  identifier: UserRepositoryProviderInterfaceResolver,
})
export class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async boot(): Promise<void> {
    return;
  }

  public async create(user: UserInterface): Promise<User> {
    return new User({ ...user, _id: mockUserInDataBase._id });
  }

  async find(id: string): Promise<User> {
    return new User({ ...mockUserInDataBase, _id: id });
  }

  public async findUserByEmail(email: string): Promise<User> {
    if (email === mockUserInDataBase.email) {
      return new User({
        ...mockUserInDataBase,
      });
    }
  }

  public async findUserByToken(param: { emailConfirm?: string; forgottenReset?: string }): Promise<User> {
    return new User({
      ...mockUserInDataBase,
    });
  }

  async patchUser(id: string, patch: any, context: any): Promise<User> {
    return new User({
      ...mockUserInDataBase,
      ...patch,
      _id: id,
    });
  }

  async patch(id: string, patch: any): Promise<User> {
    return new User({
      ...mockUserInDataBase,
      ...patch,
      _id: id,
    });
  }

  async list(filters, pagination): Promise<any> {
    return {
      users: [new User(mockUserInDataBase)],
      total: mockOutputPagination.total,
      count: mockOutputPagination.count,
    };
  }

  public async update(user: any): Promise<User> {
    return new User({
      ...user,
    });
  }
}

@Container.provider({
  identifier: CryptoProviderInterfaceResolver,
})
export class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  async comparePassword(plainPassword: string, cryptedPassword: string): Promise<boolean> {
    if (cryptedPassword === mockUserInDataBase.password && plainPassword === password) {
      return true;
    }
  }
  async cryptPassword(plainPassword: string): Promise<string> {
    return 'cryptedNewPassword';
  }
  async cryptToken(plainToken: string): Promise<string> {
    return 'cryptedToken';
  }

  async compareForgottenToken(plainToken: string, cryptedToken: string): Promise<boolean> {
    if (cryptedToken === 'cryptedToken' && plainToken === 'token') {
      return true;
    }
  }

  generateToken(length?: number): string {
    const tokens = [
      'EhWDV9WbltMgD6hQblL6jleDk1UMaorU',
      '2AgQryXU1ZWrHeo6EXIT257785OaaiFM',
      'Z9sfFkJFZBXjIjPZn8AsygyjsuVI6wr3',
      'jCMvUPGMOSgLQBkiXyzxzgS6rZn5xVYd',
    ];
    const idx = Math.floor(Math.random() * tokens.length);
    return tokens[idx];
  }
}

@Container.provider({
  identifier: Interfaces.KernelInterfaceResolver,
})
export class FakeKernel extends Interfaces.KernelInterfaceResolver {
  async boot(): Promise<void> {
    return;
  }

  async notify(method: string, params: any[] | { [p: string]: any }, context: Types.ContextType): Promise<void> {
    return;
  }

  async call(
    method: string,
    params: any[] | { [p: string]: any },
    context: Types.ContextType,
  ): Promise<Types.ResultType> {
    return;
  }
}

@Container.provider({
  identifier: ConfigInterfaceResolver,
})
export class FakeConfig extends ConfigInterfaceResolver {
  async boot() {
    return;
  }

  get(key: string, fallback?: any): any {
    return 'config';
  }
}
