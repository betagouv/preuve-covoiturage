import { sprintf } from 'sprintf-js';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConfigInterfaceResolver, KernelInterfaceResolver } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/sendConfirmEmail.contract';
import { alias } from '../shared/user/sendConfirmEmail.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

/*
 * send the confirmation email to a user by _id
 */
@handler(configHandler)
export class SendConfirmEmailUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
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

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const contextParam: { territory?: string; operator?: string } = {};

    if (context.call.user.territory) {
      contextParam.territory = context.call.user.territory;
    }

    if (context.call.user.operator) {
      contextParam.operator = context.call.user.operator;
    }

    const user = await this.userRepository.findUser(params._id, contextParam);

    // generate a token and store in the user
    const token = this.cryptoProvider.generateToken();
    await this.userRepository.patchUser(
      user._id,
      {
        forgotten_token: await this.cryptoProvider.cryptToken(token),
        forgotten_at: new Date(),
        status: 'pending',
      },
      contextParam,
    );

    const link = sprintf(
      '%s/confirm-email/%s/%s/',
      this.config.get('url.appUrl'),
      encodeURIComponent(user.email),
      encodeURIComponent(token),
    );

    // debug data for testing
    if (process.env.NODE_ENV === 'testing') {
      console.log(`
******************************************
[test] Send confirm email to user (${user._id.toString()})
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
        template: this.config.get('email.templates.confirmation'),
        email: user.email,
        fullname: `${user.firstname} ${user.lastname}`,
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
