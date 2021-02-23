import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, InvalidRequestException } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/create.contract';
import { alias } from '../shared/user/create.schema';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';

/*
 * Create user and call forgotten password action
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    [
      'has_permission_by_scope',
      [
        'user.create',
        [
          [
            'territory.users.add',
            'call.user.territory_id',
            'territory_id',
          ],
          [
            'operator.users.add',
            'call.user.operator_id',
            'operator_id'
          ],
        ],
      ],
    ],
    ['content.whitelist', userWhiteListFilterOutput],
  ],
})
export class CreateUserAction extends AbstractAction {
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private notification: UserNotificationProvider,
    private authRepository: AuthRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // check if the user exists already
    await this.userRepository.checkForDoubleEmailAndFail(request.email);

    if ('operator_id' in request && 'territory_id' in request) {
      // todo: check this in jsonschema
      throw new InvalidRequestException('Cannot assign operator and territory at the same time');
    }

    const userCreated = await this.userRepository.create(request);

    const token = await this.authRepository.createTokenByEmail(
      userCreated.email,
      this.authRepository.INVITATION_TOKEN,
      this.authRepository.INVITED_STATUS,
    );

    await this.notification.userCreated(token, userCreated.email);

    return userCreated;
  }
}
