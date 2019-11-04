import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, InvalidRequestException, ConflictException } from '@ilos/common';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/create.contract';
import { alias } from '../shared/user/create.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';

/*
 * Create user and call forgotten password action
 */
@handler(configHandler)
export class CreateUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
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
    private notification: UserNotificationProvider,
    private authRepository: AuthRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // check if the user exists already
    const foundUser = await this.userRepository.findByEmail(request.email);
    if (foundUser) {
      throw new ConflictException('email conflict');
    }

    if ('operator' in request && 'territory' in request) {
      // todo: check this in jsonschema
      throw new InvalidRequestException('Cannot assign operator and AOM at the same time');
    }

    const userCreated = await this.userRepository.create(request);

    const token = await this.authRepository.createTokenByEmail(
      userCreated.email,
      this.authRepository.INVITATION_TOKEN,
      this.authRepository.INVITED_STATUS,
    );

    await this.notification.userCreated(userCreated, token);

    return userCreated;
  }
}
