import { Parents, Container, Exceptions, Providers, Types, Interfaces } from '@pdc/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { User } from '../entities/User';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { CreateUserParamsInterface, UserDbInterface } from '../interfaces/UserInterfaces';

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

  public async handle(request: CreateUserParamsInterface, context: Types.ContextType): Promise<User> {
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
      ...request,
      status: this.config.get('user.status.invited'),
      password: await this.cryptoProvider.cryptPassword(request.password),
      permissions: await this.config.get(`permissions.${request.group}.${request.role}.permissions`),
    });

    const userCreated = await this.userRepository.create(user);

    // generate new token for a password reset on first access
    return this.kernel.call(
      'user:forgottenPassword',
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
