import { Container, Interfaces, Types } from '@ilos/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto/dist';

import { UserRepositoryProviderInterfaceResolver } from '../../src/interfaces/repository/UserRepositoryProviderInterface';
import { User } from '../../src/entities/User';
import { mockNewUserBase } from '../mocks/newUserBase';
import { ConfigInterfaceResolver } from '@ilos/config';

@Container.provider()
export class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async boot(): Promise<void> {
    return;
  }
  async patchUser(id: string, patch: any, context: any): Promise<User> {
    return new User({
      ...mockNewUserBase,
      ...patch,
    });
  }

  async find(id: string): Promise<User> {
    return new User(mockNewUserBase);
  }
}

export class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  async cryptToken(plainToken: string): Promise<string> {
    return 'cryptedToken';
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

@Container.provider()
export class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
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

@Container.provider()
export class FakeConfigProvider extends ConfigInterfaceResolver {
  async boot() {
    return;
  }

  get(key: string, fallback?: any): any {
    return 'config';
  }
}
