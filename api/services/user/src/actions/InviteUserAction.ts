import { Parents, Container, Types, Interfaces } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { User } from '../entities/User';

/*
 * find user by id and send email to set first password
 */
@Container.handler({
  service: 'user',
  method: 'notify',
})
export class InviteUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.invite'],
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

  public async handle(params: { id: string }, context: Types.ContextType): Promise<User> {
    const requester = new User(context.call.user);

    // await this.kernel.notify(
    //   'notification:sendtemplatemail',
    //   {
    //     template: this.config.get('email.templates.invite'),
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

    return requester;
  }
}
