import { Parents, Container, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserChangeEmailParamsInterface } from '../interfaces/UserChangeEmailParamsInterface';

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
    ['filterOutput', ['password']],
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

    const emailChangeAt = new Date();
    const confirm = this.cryptoProvider.generateToken();
    const token = this.cryptoProvider.generateToken();

    const requester = new User(context.call.user);

    // await this.kernel.notify(
    //   'notification:sendtemplatemail',
    //   {
    //     template: 'confirmEmail',
    //     email: user.email,
    //     fullName: user.fullname,
    //     opts: {
    //       requester: requester.fullname,
    //       organization: 'AomOrOperatorOrganisation',
    //       link: `${this.config.get('url.appUrl')}/confirm-email/${confirm}/${token}`,
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

    return this.userRepository.patch(user._id, {
      confirm,
      emailChangeAt,
      token,
      email: params.email,
    });
  }
}
