import { sprintf } from 'sprintf-js';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConfigInterfaceResolver, KernelInterfaceResolver } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

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

    const token = this.cryptoProvider.generateToken();
    user.forgotten_token = await this.cryptoProvider.cryptToken(token);
    user.forgotten_at = new Date();
    user.status = 'pending';

    await this.userRepository.update(user);

    const link = sprintf(
      '%s/reset-forgotten-password/%s/%s/',
      this.config.get('url.appUrl'),
      encodeURIComponent(user.email),
      encodeURIComponent(token),
    );

    // debug data for testing
    if (process.env.NODE_ENV === 'testing') {
      console.log(`
******************************************
[test] Forgotten Password
email: ${user.email}
token: ${token}
link:  ${link}
******************************************
      `);
    }

    // TODO check this
    // generate a context if missing
    const ctx = context || {
      call: { user },
      channel: {
        service: 'user',
        transport: 'http',
      },
    };

    await this.kernel.call(
      'user:notify',
      {
        link,
        template: this.config.get('email.templates.forgotten'),
        email: user.email,
        fullname: user.fullname,
        templateId: this.config.get('notification.templateIds.forgotten'),
      },
      {
        call: ctx.call,
        channel: {
          ...ctx.channel,
          service: 'user',
        },
      },
    );

    return;
  }
}
