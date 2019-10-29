import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, UnauthorizedException } from '@ilos/common';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/me.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserContextInterface } from '../shared/user/common/interfaces/UserContextInterfaces';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Find user by id
 */
@handler(configHandler)
export class MeUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['content.whitelist', userWhiteListFilterOutput]];
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(request: null, context: UserContextInterface): Promise<ResultInterface> {
    const _id = get(context, 'call.user._id', null);

    if (!_id) {
      throw new UnauthorizedException('No connected user');
    }

    return this.userRepository.findUser(_id, {});
  }
}
