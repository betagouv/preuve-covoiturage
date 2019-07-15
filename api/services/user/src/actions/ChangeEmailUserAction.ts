import { Action as AbstractAction } from '@ilos/core';
import {
  ConfigInterfaceResolver,
  handler,
  ContextType,
  KernelInterfaceResolver,
} from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserChangeEmailParamsInterface } from '../interfaces/actions/UserChangeEmailParamsInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Update email of user and send email for confirmation
 */
@handler({
  service: 'user',
  method: 'changeEmail',
})
export class ChangeEmailUserAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.changeEmail'],
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
    private config: ConfigInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserChangeEmailParamsInterface, context: ContextType): Promise<User> {
    const user = await this.userRepository.find(params._id);
    const contextParam: { territory?: string; operator?: string } = {};

    if (context.call.user.territory) {
      contextParam.territory = context.call.user.territory;
    }

    if (context.call.user.operator) {
      contextParam.operator = context.call.user.operator;
    }

    const emailChangeAt = new Date();
    const confirm = this.cryptoProvider.generateToken();
    const token = this.cryptoProvider.generateToken();

    const cryptedToken = await this.cryptoProvider.cryptToken(token);

    const requester = new User(context.call.user);

    const patch = {
      emailChangeAt,
      emailConfirm: confirm,
      emailToken: cryptedToken,
      email: params.email,
      status: this.config.get('user.status.notActive'),
    };

    const patchedUser = this.userRepository.patchUser(params._id, patch, contextParam);

    await this.kernel.call(
      'user:notify',
      {
        template: this.config.get('email.templates.confirm'),
        email: patch.email,
        fullName: user.fullname,
        requester: requester.fullname,
        organization: 'AomOrOperatorOrganisation',
        link: `${this.config.get('url.appUrl')}/confirm-email/${confirm}/${token}`,
      },
      {
        call: context.call,
        channel: {
          ...context.channel,
          service: 'user',
        },
      },
    );

    return patchedUser;
  }
}
