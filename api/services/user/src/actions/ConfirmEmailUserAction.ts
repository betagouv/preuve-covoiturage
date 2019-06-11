import { Parents, Container, Types, Providers, Exceptions } from '@pdc/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';

export interface ConfirmEmailUserInterface {
  token: string;
  confirm: string;
}

@Container.handler({
  service: 'user',
  method: 'confirmEmail',
})
export class ConfirmEmailUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.confirmEmail'],
  ];

  constructor(
    private config: Providers.ConfigProvider,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ConfirmEmailUserInterface, context: Types.ContextType): Promise<User> {
    const user = await this.userRepository.findUserByParam({ emailConfirm: params.confirm });

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
