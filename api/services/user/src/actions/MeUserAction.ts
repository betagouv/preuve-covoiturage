import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ForbiddenException } from '@ilos/common';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';
import { User } from '../entities/User';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Find user by id
 */
@handler({
  service: 'user',
  method: 'me',
})
export class MeUserAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [['content.whitelist', userWhiteListFilterOutput]];
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(request: any, context: UserContextInterface): Promise<User> {
    const _id = get(context, 'call.user._id', null);

    if (!_id) {
      throw new ForbiddenException('No connected user');
    }

    return this.userRepository.findUser(_id, {});
  }
}
