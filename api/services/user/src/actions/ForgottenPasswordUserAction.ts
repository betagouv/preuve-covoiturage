import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConfigInterfaceResolver, KernelInterfaceResolver } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';

/*
 * find user by email and send email to set new password
 */
@handler({
  service: 'user',
  method: 'forgottenPassword',
})
export class ForgottenPasswordUserAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [['validate', 'user.forgottenPassword']];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: { email: string }, context: ContextType): Promise<void> {
    const user = await this.userRepository.findUserByParams({ email: params.email });

    const reset = this.cryptoProvider.generateToken();
    const token = this.cryptoProvider.generateToken();

    user.forgotten_reset = reset;
    user.forgotten_token = await this.cryptoProvider.cryptToken(token);
    user.forgotten_at = new Date();
    user.status = 'pending';

    const updatedUser = await this.userRepository.update(user);

    const requester = new User(context.call.user);

    await this.kernel.call(
      'user:notify',
      {
        template: this.config.get('email.templates.forgotten'),
        email: updatedUser.email,
        fullname: updatedUser.fullname,
        requester: requester.fullname,
        organization: 'TerritoryOrOperatorOrganisation',
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
