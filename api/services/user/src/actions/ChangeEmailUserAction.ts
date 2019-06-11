import { Parents, Container, Exceptions, Interfaces, Providers, Types } from '@pdc/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';

export interface ChangeEmailUserInterface {
  id: string;
  email: string;
}


@Container.handler({
  service: 'user',
  method: 'changeEmail',
})
export class ChangeEmailUserAction extends Parents.Action {
  public readonly middlewares: (string|[string, any])[] = [
    ['validate', 'user.changeEmail'],
  ];
  constructor(
    private config: Providers.ConfigProvider,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private kernel: Interfaces.KernelInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,

  ) {
    super();
  }

  public async handle(params: ChangeEmailUserInterface, context: Types.ContextType): Promise<User> {
    const user = await this.userRepository.find(params.id);

    const emailChangeAt = new Date();
    const confirm = this.cryptoProvider.generateToken();
    const token = this.cryptoProvider.generateToken();

    const requester = new User(context.call.user);

    this.kernel.notify(
      'notification:sendTemplateEmail',
      {
        template: 'changeEmail',
        email: user.email,
        fullName: user.fullname,
        opts: {
          requester: requester.fullname,
          organization: 'AomOrOperatorOrganisation',
          link: `${this.config.get('url.appUrl')}/confirm-email/${confirm}/${token}`,
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

    return this.userRepository.patch(user._id,
      {
        confirm,
        emailChangeAt,
        token,
        email: params.email,
      },
    );
  }
}
