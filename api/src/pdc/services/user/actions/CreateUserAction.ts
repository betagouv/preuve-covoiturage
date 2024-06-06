import { Action as AbstractAction } from '@/ilos/core/index.ts';
import {
  handler,
  ContextType,
  InvalidRequestException,
  ConfigInterfaceResolver,
  UnauthorizedException,
} from '@/ilos/common/index.ts';
import { contentWhitelistMiddleware, copyGroupIdAndApplyGroupPermissionMiddlewares } from '@/pdc/providers/middleware/index.ts';

import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/user/create.contract.ts';
import { alias } from '@/shared/user/create.schema.ts';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface.ts';
import { userWhiteListFilterOutput } from '../config/filterOutput.ts';
import { UserNotificationProvider } from '../providers/UserNotificationProvider.ts';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface.ts';

/*
 * Create user and call forgotten password action
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: 'registry.user.create',
      territory: 'territory.user.create',
      operator: 'operator.user.create',
    }),
    ['validate', alias],
    contentWhitelistMiddleware(...userWhiteListFilterOutput),
  ],
})
export class CreateUserAction extends AbstractAction {
  constructor(
    private config: ConfigInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private notification: UserNotificationProvider,
    private authRepository: AuthRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // Registration can be toggled by env var APP_USER_REGISTRATION_ENABLED
    if (!this.config.get('registration.enabled')) {
      console.warn('Registration disabled. Failed to create new user');
      throw new UnauthorizedException('User registration is disabled');
    }

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

    await this.notification.invite(token, userCreated.email, `${userCreated.firstname} ${userCreated.lastname}`);

    return userCreated;
  }
}
