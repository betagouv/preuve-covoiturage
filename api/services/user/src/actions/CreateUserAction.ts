import { Parents, Container, Exceptions, Providers, Types, Interfaces } from '@pdc/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { User } from '../entities/User';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { NewUserInterface, UserDbInterface } from '../interfaces/UserInterfaces';

@Container.handler({
  service: 'user',
  method: 'create',
})
export class CreateUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.create'],
    [
      'scopeIt',
      [
        ['user.create'],
        [
          (params, context) => {
            if ('aom' in params && params.aom === context.call.user.aom) {
              return 'aom.users.add';
            }
          },
          (params, context) => {
            if ('operator' in params && params.aom === context.call.user.aom) {
              return 'operator.users.add';
            }
          },
        ],
      ],
    ],
  ];
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private config: Providers.ConfigProvider,
    private kernel: Interfaces.KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: NewUserInterface, context: Types.ContextType): Promise<UserDbInterface> {
    // check if the user exists already

    const foundUser = await this.userRepository.findByEmail(request.email);
    if (foundUser) {
      throw new Exceptions.ConflictException('email conflict');
    }

    if ('operator' in request && 'aom' in request) {
      throw new Exceptions.InvalidRequestException('Cannot assign operator and AOM at the same time');
    }

    // create the new user
    const user = new User({
      email: request.email,
      firstname: request.firstname,
      lastname: request.lastname,
      group: request.group,
      role: request.role,
      phone: request.phone,
      status: 'invited',
      password: await this.cryptoProvider.cryptPassword(request.password),
      permissions: await this.config.get(`permissions.${request.group}.${request.role}.permissions`)
    });

    if ('aom' in request) {
      user.aom = request.aom;
    }
    if ('operator' in request) {
      user.operator = request.operator;
    }

    user.permissions = this.config.get(`permissions.${user.group}.${user.role}`);

    const userCreated = await this.userRepository.create(user);

    // generate new token for a password reset on first access
    return this.forgottenPassword(
      {
        requester: context.call.user.fullname,
        organisation: "operatorNameORaomName", // a récupérer de l'opérateur ou de l'aom
      },
      userCreated,
      context,
    );
  }

  private async forgottenPassword(
    invite: { requester: string; organisation: string },
    user: UserDbInterface,
    context: Types.ContextType,
  ) {
    // search for user
    if (!user) {
      throw new Exceptions.NotFoundException();
    }
    const reset = this.cryptoProvider.generateToken();
    const token = this.cryptoProvider.generateToken();

    user.forgottenReset = reset;
    user.forgottenToken = token;
    user.forgottenAt = new Date();
    const updatedUser = await this.userRepository.update(user);

    // this.kernel.notify(
    //   'notification:sendTemplateEmail',
    //   {
    //     template: 'invite',
    //     email: user.email,
    //     fullName: user.fullname,
    //     opts: {
    //       requester: invite.requester,
    //       organization: invite.organisation,
    //       link: `${this.config.get('url.appUrl')}/confirm-email/${reset}/${token}`,
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
