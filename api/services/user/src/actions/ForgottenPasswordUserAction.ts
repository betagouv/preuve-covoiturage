import { Parents, Container, Providers, Types, Interfaces } from '@pdc/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';

interface ForgottenPasswordUserInterface {
  id: string;
}

@Container.handler({
  service: 'user',
  method: 'forgottenPassword',
})
export class ForgottenPasswordUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.forgottenPassword'],
  ];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private config: Providers.ConfigProvider,
    private kernel: Interfaces.KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ForgottenPasswordUserInterface, context: Types.ContextType): Promise<UserDbInterface> {
    const user = await this.userRepository.find(params.id);

    const reset = this.cryptoProvider.generateToken();
    const token = this.cryptoProvider.generateToken();

    user.forgottenReset = reset;
    user.forgottenToken = token;
    user.forgottenAt = new Date();

    const updatedUser = await this.userRepository.update(user);

    const requester = new User(context.call.user);

    this.kernel.notify(
      'notification:sendTemplateEmail',
      {
        template: 'invite',
        email: updatedUser.email,
        fullName: updatedUser.fullname,
        opts: {
          requester: requester.fullname,
          organization: 'AomOrOperatorOrganisation',
          link: `${this.config.get('url.appUrl')}/confirm-email/${reset}/${token}`,
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
