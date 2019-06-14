import { Parents, Container, Exceptions, Types, Interfaces } from '@ilos/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { User } from '../entities/User';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserCreateParamsInterface } from '../interfaces/actions/UserCreateParamsInterface';

/*
 * Create user and call forgotten password action
 */
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

  public async handle(request: UserCreateParamsInterface, context: Types.ContextType): Promise<User> {
    try {
      // check if the user exists already
      const foundUser = await this.userRepository.findUserByParams({ email: request.email });
      if (foundUser) {
        throw new Exceptions.ConflictException('email conflict');
      }
    } catch (e) {
      // don't throw no found error
    }

    if ('operator' in request && 'aom' in request) {
      throw new Exceptions.InvalidRequestException('Cannot assign operator and AOM at the same time');
    }

    // create the new user
    const user = new User({
      ...request,
      status: this.config.get('user.status.invited'),
      permissions: await this.config.get(`permissions.${request.group}.${request.role}.permissions`),
      emailChangeAt: new Date(),
    });

    const userCreated = await this.userRepository.create(user);

    // generate new token for a password reset on first access
    // TODO move invite to method of this action
    await this.createInvitation(user);
    return user;
  }

  async createInvitation(user: User) {
    // const reset = this.cryptoProvider.generateToken();
    // const token = this.cryptoProvider.generateToken();
    // // set forgotten password properties to set first password
    // user.forgottenReset = reset;
    // user.forgottenToken = await this.cryptoProvider.cryptToken(token);
    // user.forgottenAt = new Date();
    // await this.userRepository.update(user);
    // await this.kernel.notify(
    //   'user:notification',
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
  }
}
