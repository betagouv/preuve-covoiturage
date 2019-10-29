import { sprintf } from 'sprintf-js';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConfigInterfaceResolver, KernelInterfaceResolver } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

/*
 * send the confirmation email to a user by _id
 */
@handler({
  service: 'user',
  method: 'sendInvitationEmail',
})
export class SendInvitationEmailUserAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.sendInvitationEmail'],
    [
      'scopeIt',
      [
        ['user.send-confirm-email'],
        [
          (_params, context) => {
            if (context.call.user.territory) {
              return 'territory.users.send-confirm-email';
            }
          },
          (_params, context) => {
            if (context.call.user.operator) {
              return 'operator.users.send-confirm-email';
            }
          },
        ],
      ],
    ],
  ];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: { _id: string }, context: ContextType): Promise<void> {
    const contextParam: { territory?: string; operator?: string } = {};

    if (context.call.user.territory) {
      contextParam.territory = context.call.user.territory;
    }

    if (context.call.user.operator) {
      contextParam.operator = context.call.user.operator;
    }

    const user = await this.userRepository.findUser(params._id, contextParam);

    // generate new token for a password reset on first access
    const reset = this.cryptoProvider.generateToken();
    const token = this.cryptoProvider.generateToken();

    // set forgotten password properties to set first password
    user.forgotten_token = await this.cryptoProvider.cryptToken(token);
    user.forgotten_at = new Date();

    await this.userRepository.update(user);

    const link = sprintf(
      '%s/activate/%s/%s/',
      this.config.get('url.appUrl'),
      encodeURIComponent(user.email),
      encodeURIComponent(token),
    );

    // debug data for testing
    if (process.env.NODE_ENV === 'testing') {
      console.log(`
******************************************
[test] Create user
email: ${user.email}
token: ${token}
link:  ${link}
******************************************
      `);
    }

    await this.kernel.call(
      'user:notify',
      {
        link,
        template: this.config.get('email.templates.invitation'),
        email: user.email,
        fullname: user.fullname,
        templateId: this.config.get('notification.templateIds.invitation'),
      },
      {
        call: context.call,
        channel: {
          ...context.channel,
          service: 'user',
        },
      },
    );
  }
}
