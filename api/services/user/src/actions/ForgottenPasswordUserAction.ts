import { Parents, Container, Types, Interfaces } from '@ilos/core';
import { ConfigInterfaceResolver } from '@ilos/config';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * find user by email and send email to set new password
 */
@Container.handler({
  service: 'user',
  method: 'forgottenPassword',
})
export class ForgottenPasswordUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [['validate', 'user.forgottenPassword']];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
    private kernel: Interfaces.KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: { email: string }, context: Types.ContextType): Promise<void> {
    const user = await this.userRepository.findUserByParams({ email: params.email });

    const reset = this.cryptoProvider.generateToken();
    const token = this.cryptoProvider.generateToken();

    user.forgottenReset = reset;
    user.forgottenToken = await this.cryptoProvider.cryptToken(token);
    user.forgottenAt = new Date();
    user.status = this.config.get('user.status.notActive');

    const updatedUser = await this.userRepository.update(user);

    const requester = new User(context.call.user);

    await this.kernel.call(
      'user:notify',
      {
        template: this.config.get('email.templates.forgotten'),
        email: updatedUser.email,
        fullName: updatedUser.fullname,
        requester: requester.fullname,
        organization: 'AomOrOperatorOrganisation',
        link: `${this.config.get('url.appUrl')}/reset-password/${reset}/${token}`,
      },
      {
        call: context.call,
        channel: {
          ...context.channel,
          service: 'user',
        },
      },
    );

    return;
  }
}
