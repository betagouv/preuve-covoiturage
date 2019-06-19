import { Parents, Container, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserChangeEmailParamsInterface } from '../interfaces/actions/UserChangeEmailParamsInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Update email of user and send email for confirmation
 */
@Container.handler({
  service: 'user',
  method: 'changeEmail',
})
export class ChangeEmailUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.changeEmail'],
    [
      'scopeIt',
      [
        ['user.update'],
        [
          (params, context) => {
            if ('id' in params && params.id === context.call.user._id) {
              return 'profile.update';
            }
          },
          (_params, context) => {
            if ('aom' in context.call.user) {
              return 'aom.users.update';
            }
          },
          (_params, context) => {
            if ('operator' in context.call.user) {
              return 'operator.users.update';
            }
          },
        ],
      ],
    ],
    ['content.whitelist', userWhiteListFilterOutput],
  ];
  constructor(
    private config: ConfigProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private kernel: Interfaces.KernelInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserChangeEmailParamsInterface, context: Types.ContextType): Promise<User> {
    const user = await this.userRepository.find(params.id);
    const contextParam: { aom?: string; operator?: string } = {};

    if ('aom' in context.call.user) {
      contextParam.aom = context.call.user.aom;
    }

    if ('operator' in context.call.user) {
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

    const patchedUser = this.userRepository.patchUser(params.id, patch, contextParam);

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
