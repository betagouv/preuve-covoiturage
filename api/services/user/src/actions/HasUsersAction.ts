import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import { handlerConfig, ResultInterface } from '../shared/user/hasUsers.contract';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

/*
 * Change password of user by sending old & new password
 */
@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares('trip')],
})
export class HasUsersAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    return this.userRepository.hasUsers();
  }
}
