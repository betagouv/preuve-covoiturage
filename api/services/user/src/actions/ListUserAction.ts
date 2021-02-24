import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { contentWhitelistMiddleware, copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/list.contract';
import { alias } from '../shared/user/list.schema';
import { UserContextInterface } from '../shared/user/common/interfaces/UserContextInterfaces';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

const whiteList = [
  '_id',
  'email',
  'lastname',
  'firstname',
  'phone',
  'group',
  'role',
  'status',
  'operator_id',
  'territory_id',
];

/*
 * list users filtered by territory or operator and paginate with limit & skip
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: 'registry.user.list',
      territory: 'territory.user.list',
      operator: 'operator.user.list',
    }),
    contentWhitelistMiddleware(...whiteList.map((key: string) => `data.*.${key}`), 'meta.*'), // TODO : A VERIFIER
  ],
})
export class ListUserAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: UserContextInterface): Promise<ResultInterface> {
    const { operator_id, territory_id, ...pagination } = params;

    const data = await this.userRepository.list({ operator_id, territory_id }, pagination);

    return {
      data: data.users,
      meta: {
        pagination: {
          total: data.total,
          ...params,
        },
      },
    };
  }
}
