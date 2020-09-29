import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/deleteAssociated.contract';
import { alias } from '../shared/user/deleteAssociated.schema';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

/*
 *  Find user by id and delete user
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['channel.service.only', ['territory', 'operator']],
  ],
})
export class DeleteAssociatedUserAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const key = Object.keys(params)[0];

    // KEEP ME
    console.log(`> [user:deleteAssociated] ${key}: ${params[key]}`);

    await this.userRepository.deleteAssociated(key, params[key]);
  }
}
