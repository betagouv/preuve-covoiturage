import { Parents, Container, Exceptions, Types, Interfaces } from '@ilos/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { ConfigInterfaceResolver } from '@ilos/config';

import { User } from '../entities/User';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserCreateParamsInterface } from '../interfaces/actions/UserCreateParamsInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

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
            if ('territory' in params && params.territory === context.call.user.territory) {
              return 'territory.users.add';
            }
          },
          (params, context) => {
            if ('operator' in params && params.operator === context.call.user.operator) {
              return 'operator.users.add';
            }
          },
        ],
      ],
    ],
    ['content.whitelist', userWhiteListFilterOutput],
  ];
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
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
      if (e instanceof Exceptions.ConflictException) {
        throw e;
      }
    }

    if ('operator' in request && 'territory' in request) {
      // todo: check this in jsonschema
      throw new Exceptions.InvalidRequestException('Cannot assign operator and AOM at the same time');
    }

    // create the new user
    const user = new User({
      ...request,
      status: this.config.get('user.status.notActive'),
      password: Math.random()
        .toString(36)
        .substring(2, 15),
      permissions: await this.config.get(`permissions.${request.group}.${request.role}.permissions`),
      emailChangeAt: new Date(),
    });

    const userCreated = await this.userRepository.create(user);

    await this.createInvitation(userCreated, context);

    return userCreated;
  }

  async createInvitation(user: User, context: Types.ContextType) {
    // generate new token for a password reset on first access
    const reset = this.cryptoProvider.generateToken();
    const token = this.cryptoProvider.generateToken();
    // set forgotten password properties to set first password
    user.forgottenReset = reset;
    user.forgottenToken = await this.cryptoProvider.cryptToken(token);
    user.forgottenAt = new Date();

    await this.userRepository.update(user);

    const requester = new User(context.call.user);

    await this.kernel.call(
      'user:notify',
      {
        template: this.config.get('email.templates.invite'),
        email: user.email,
        fullName: user.fullname,
        requester: requester.fullname,
        organization: 'AomOrOperatorOrganisation',
        link: `${this.config.get('url.appUrl')}/reset-password/${reset}/${token}`,
      },
      {
        call: context.call,
        channel: {
          ...context.channel,
          service: 'user',
        },
      },
    );
  }
}
