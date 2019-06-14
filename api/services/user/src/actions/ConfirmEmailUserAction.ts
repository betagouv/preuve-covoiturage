import { Parents, Container, Types, Exceptions } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserConfirmEmailParamsInterface } from '../interfaces/actions/UserConfirmEmailParamsInterface';

/*
 * Confirm email by getting user from 'confirm' and verifying uncrypted 'token' with crypted 'emailToken'
 */
@Container.handler({
  service: 'user',
  method: 'confirmEmail',
})
export class ConfirmEmailUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.confirmEmail'],
    ['filterOutput', ['password']],
  ];

  constructor(
    private config: ConfigProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserConfirmEmailParamsInterface, context: Types.ContextType): Promise<User> {
    const user = await this.userRepository.findUserByParams({ emailConfirm: params.confirm });

    if (!(await this.cryptoProvider.compareForgottenToken(params.token, user.emailToken))) {
      throw new Exceptions.ForbiddenException('Invalid token');
    }

    // Token expired after 1 day
    if ((Date.now() - user.emailChangeAt.getTime()) / 1000 > this.config.get('user.tokenExpiration.emailConfirm')) {
      user.emailConfirm = undefined;
      user.emailToken = undefined;
      await this.userRepository.update(user);

      throw new Exceptions.ForbiddenException('Expired token');
    }

    user.status = this.config.get('user.status.active');

    return this.userRepository.update(user);
  }
}
