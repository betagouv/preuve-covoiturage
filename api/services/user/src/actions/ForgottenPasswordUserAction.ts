import { Parents, Container, Types, Interfaces } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserForgottenPasswordParamsInterface } from '../interfaces/UserForgottenPasswordParamsInterface';

@Container.handler({
  service: 'user',
  method: 'forgottenPassword',
})
export class ForgottenPasswordUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [['validate', 'user.forgottenPassword']];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private config: ConfigProviderInterfaceResolver,
    private kernel: Interfaces.KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserForgottenPasswordParamsInterface, context: Types.ContextType): Promise<User> {
    // todo: find by email ?
    const user = await this.userRepository.find(params.id);

    const reset = this.cryptoProvider.generateToken();
    const token = this.cryptoProvider.generateToken();

    user.forgottenReset = reset;
    user.forgottenToken = token;
    user.forgottenAt = new Date();

    const updatedUser = await this.userRepository.update(user);

    const requester = new User(context.call.user);

    await this.kernel.notify(
      'notification:sendTemplateEmail',
      {
        template: 'invite',
        email: updatedUser.email,
        fullName: updatedUser.fullname,
        opts: {
          requester: requester.fullname,
          organization: 'AomOrOperatorOrganisation',
          link: `${this.config.get('url.appUrl')}/reset-password/${reset}/${token}`,
        },
      },
      {
        call: context.call,
        channel: {
          ...context.channel,
          service: 'user',
        },
      },
    );

    return updatedUser;
  }
}
