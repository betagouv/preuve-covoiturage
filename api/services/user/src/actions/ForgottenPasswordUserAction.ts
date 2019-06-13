import { Parents, Container, Types, Interfaces } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserForgottenPasswordParamsInterface } from '../interfaces/UserForgottenPasswordParamsInterface';

/*
 * find user by id or email and send email to set new password
 */
@Container.handler({
  service: 'user',
  method: 'forgottenPassword',
})
export class ForgottenPasswordUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.forgottenPassword'],
    ['filterOutput', ['password']],
  ];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private config: ConfigProviderInterfaceResolver,
    private kernel: Interfaces.KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserForgottenPasswordParamsInterface, context: Types.ContextType): Promise<User> {
    let user: User;
    let template: string;

    if (params.email) {
      user = await this.userRepository.findUserByParams({ email: params.email });
      template = this.config.get('email.templates.forgotten');
    } else {
      user = await this.userRepository.find(params.id);
      template = this.config.get('email.templates.invite');
    }

    const reset = this.cryptoProvider.generateToken();
    const token = this.cryptoProvider.generateToken();

    user.forgottenReset = reset;
    user.forgottenToken = token;
    user.forgottenAt = new Date();

    const updatedUser = await this.userRepository.update(user);

    const requester = new User(context.call.user);

    // await this.kernel.notify(
    //   'notification:sendtemplatemail',
    //   {
    //     template,
    //     email: updatedUser.email,
    //     fullName: updatedUser.fullname,
    //     opts: {
    //       requester: requester.fullname,
    //       organization: 'AomOrOperatorOrganisation',
    //       link: `${this.config.get('url.appUrl')}/reset-password/${reset}/${token}`,
    //     },
    //   },
    //   {
    //     call: context.call,
    //     channel: {
    //       ...context.channel,
    //       service: 'user',
    //     },
    //   },
    // );

    return updatedUser;
  }
}
