import { sprintf } from 'sprintf-js';
import { Action as AbstractAction } from '@ilos/core';
import {
  handler,
  ContextType,
  ConfigInterfaceResolver,
  InvalidRequestException,
  ConflictException,
  KernelInterfaceResolver,
} from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { UserCreateParamsInterface } from '@pdc/provider-schema';

import { User } from '../entities/User';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Create user and call forgotten password action
 */
@handler({
  service: 'user',
  method: 'create',
})
export class CreateUserAction extends AbstractAction {
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
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: UserCreateParamsInterface, context: ContextType): Promise<User> {
    try {
      // check if the user exists already
      const foundUser = await this.userRepository.findUserByParams({ email: request.email });
      if (foundUser) {
        throw new ConflictException('email conflict');
      }
    } catch (e) {
      if (e instanceof ConflictException) {
        throw e;
      }
    }

    if ('operator' in request && 'territory' in request) {
      // todo: check this in jsonschema
      throw new InvalidRequestException('Cannot assign operator and AOM at the same time');
    }

    // create the new user
    const user = new User({
      ...request,
      status: 'pending',
      password: Math.random()
        .toString(36)
        .substring(2, 15),
      permissions: await this.config.get(`permissions.${request.group}.${request.role}.permissions`),
    });

    const userCreated = await this.userRepository.create(user);

    await this.createInvitation(userCreated, context);

    return userCreated;
  }

  async createInvitation(user: User, context: ContextType) {
    // generate new token for a password reset on first access
    const reset = this.cryptoProvider.generateToken();
    const token = this.cryptoProvider.generateToken();

    // set forgotten password properties to set first password
    user.forgotten_token = await this.cryptoProvider.cryptToken(token);
    user.forgotten_at = new Date();

    await this.userRepository.update(user);

    const link = sprintf(
      '%s/activate/%s/%s/',
      this.config.get('url.appUrl'),
      encodeURIComponent(user.email),
      encodeURIComponent(token),
    );

    // debug data for testing
    if (process.env.NODE_ENV === 'testing') {
      console.log(`
******************************************
[test] Create user
email: ${user.email}
token: ${token}
link:  ${link}
******************************************
      `);
    }

    await this.kernel.call(
      'user:notify',
      {
        link,
        template: this.config.get('email.templates.invitation'),
        email: user.email,
        fullname: user.fullname,
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
