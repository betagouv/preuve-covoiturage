import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConflictException, UnauthorizedException } from '@ilos/common';
import { contentWhitelistMiddleware, copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/providers/middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/user/patch.contract';
import { alias } from '@shared/user/patch.schema';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';

/*
 * Update properties of user ( firstname, lastname, phone )
 * The user is switched to 'pending' when the email is modified.
 * A confirmation link is sent to the new email and a notification to the old one.
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      user: 'common.user.update',
      registry: 'registry.user.update',
      territory: 'territory.user.update',
      operator: 'operator.user.update',
    }),
    contentWhitelistMiddleware(...userWhiteListFilterOutput),
  ],
})
export class PatchUserAction extends AbstractAction {
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private notification: UserNotificationProvider,
    private authRepository: AuthRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const scope = params.territory_id ? 'territory_id' : params.operator_id ? 'operator_id' : 'none';

    const _id = params._id;
    const { email, ...patch } = params.patch;

    let user;

    if (params.patch.email) {
      await this.userRepository.checkForDoubleEmailAndFail(params.patch.email, params._id);
    }

    switch (scope) {
      case 'territory_id':
        user = await this.userRepository.findByTerritory(_id, params[scope]);
        break;
      case 'operator_id':
        user = await this.userRepository.findByOperator(_id, params[scope]);
        break;
      case 'none':
        user = await this.userRepository.find(_id);
        break;
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    const updatedUser = await this.userRepository.patch(_id, patch);
    if (patch.role) await this.userRepository.patchRole(_id, patch.role, true);

    // user didn't change her email
    if (!email || email === user.email) {
      return updatedUser;
    }

    // user changed her email -> ask for email confirmation
    try {
      const token = await this.authRepository.updateEmailById(_id, email);
      await this.notification.emailUpdated(
        token,
        email,
        user.email,
        `${updatedUser.firstname} ${updatedUser.lastname}`,
      );
      return {
        ...updatedUser,
        email,
      };
    } catch (e) {
      switch (e.code) {
        case 11000:
          throw new ConflictException();
        default:
          throw e;
      }
    }
  }
}
