import { sprintf } from 'sprintf-js';
import { Action as AbstractAction } from '@ilos/core';
import { UserPatchParamsInterface } from '@pdc/provider-schema';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { handler, ContextType, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';

import { User } from '../entities/User';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Update properties of user ( firstname, lastname, phone )
 * The user is switched to 'pending' when the email is modified.
 * A confirmation link is sent to the new email and a notification to the old one.
 */
@handler({
  service: 'user',
  method: 'patch',
})
export class PatchUserAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.patch'],
    [
      'scopeIt',
      [
        ['user.update'],
        [
          (params, context) => {
            if ('_id' in params && params._id === context.call.user._id) {
              return 'profile.update';
            }
          },
          (_params, context) => {
            if (context.call.user.territory) {
              return 'territory.users.update';
            }
          },
          (_params, context) => {
            if (context.call.user.operator) {
              return 'operator.users.update';
            }
          },
        ],
      ],
    ],
    ['content.whitelist', userWhiteListFilterOutput],
  ];
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserPatchParamsInterface, context: ContextType): Promise<User> {
    const contextParam: { territory?: string; operator?: string } = {};

    if (context.call.user.territory) {
      contextParam.territory = context.call.user.territory;
    }

    if (context.call.user.operator) {
      contextParam.operator = context.call.user.operator;
    }

    const patch: any = { ...params.patch };

    /**
     * set the status to 'pending' when the user changes her email
     * and send an email with a confirmation link
     */
    if (params.patch && params.patch.email) {
      const user = await this.userRepository.find(params._id);
      if (user.email !== params.patch.email) {
        // generate a token and store in the user
        const token = this.cryptoProvider.generateToken();
        patch.forgotten_token = await this.cryptoProvider.cryptToken(token);
        patch.forgotten_at = new Date();
        patch.status = 'pending';

        const link = sprintf(
          '%s/confirm-email/%s/%s/',
          this.config.get('url.appUrl'),
          encodeURIComponent(patch.email),
          encodeURIComponent(token),
        );

        // debug data for testing
        // if (process.env.NODE_ENV === 'testing') {
        console.log(`
******************************************
[test] Patch user
email: ${patch.email}
token: ${token}
link:  ${link}
******************************************
                `);
        // }

        // Notify the new email with a confirmation link
        await this.kernel.call(
          'user:notify',
          {
            link,
            template: this.config.get('email.templates.confirmation'),
            email: patch.email,
            fullname: user.fullname,
          },
          {
            call: context.call,
            channel: {
              ...context.channel,
              service: 'user',
            },
          },
        );

        // Notify the previous email about the change
        await this.kernel.call(
          'user:notify',
          {
            template: this.config.get('email.templates.email_changed'),
            email: user.email,
            fullname: user.fullname,
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

    return this.userRepository.patchUser(params._id, patch, contextParam);
  }
}
