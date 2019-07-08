import { Parents, Container, Types } from '@ilos/core';
import { ConfigInterfaceResolver } from '@ilos/config';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { User } from '../entities/User';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserRegisterParamsInterface } from '../interfaces/actions/UserRegisterParamsInterface';

/*
 * Create user and call forgotten password action
 */
@Container.handler({
  service: 'user',
  method: 'register',
})
export class RegisterUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    // TODO internal call only
    ['validate', 'user.register'],
  ];
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: UserRegisterParamsInterface, context: Types.ContextType): Promise<User> {
    // create the new user
    const newHashPassword = await this.cryptoProvider.cryptPassword(request.password);

    const user = new User({
      ...request,
      status: this.config.get('user.status.active'),
      password: newHashPassword,
      permissions: await this.config.get(`permissions.${request.group}.${request.role}.permissions`),
      emailChangeAt: new Date(),
    });

    const userCreated = await this.userRepository.create(user);

    return userCreated;
  }
}
