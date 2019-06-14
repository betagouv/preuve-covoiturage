import { Parents, Container, Exceptions, Types, Interfaces } from '@ilos/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { User } from '../entities/User';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserCreateParamsInterface } from '../interfaces/UserCreateParamsInterface';

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
    return this.kernel.call(
      'user:invite',
      {
        id: userCreated._id,
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
