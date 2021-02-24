import { Action as AbstractAction } from '@ilos/core';
import { handler, NotFoundException } from '@ilos/common';
import { contentWhitelistMiddleware } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/me.contract';
import { UserContextInterface } from '../shared/user/common/interfaces/UserContextInterfaces';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware/dist';

/*
 * Find user by id
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      user: 'common.user.find',
    }),
    contentWhitelistMiddleware(userWhiteListFilterOutput),
  ],
})
export class MeUserAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: UserContextInterface): Promise<ResultInterface> {
    const user = await this.userRepository.find(params._id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
