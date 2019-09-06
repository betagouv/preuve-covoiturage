import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConfigInterfaceResolver, ConflictException } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { UserRegisterParamsInterface } from '@pdc/provider-schema';

import { User } from '../entities/User';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

/*
 * Register a new user
 */
@handler({
  service: 'user',
  method: 'register',
})
export class RegisterUserAction extends AbstractAction {
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

  public async handle(request: UserRegisterParamsInterface, context: ContextType): Promise<User> {
    // check for duplicates
    // findUserByParams throws an Error when the user is not found
    // (what we want here...), which is the reason for the try...catch
    let found = false;
    try {
      await this.userRepository.findUserByParams({ email: request.email });
      found = true;
    } catch (e) {}

    if (found) {
      throw new ConflictException();
    }

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
