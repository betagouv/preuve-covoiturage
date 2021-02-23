import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/list.contract';
import { alias } from '../shared/user/list.schema';
import { UserContextInterface } from '../shared/user/common/interfaces/UserContextInterfaces';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserListFiltersInterface } from '../shared/user/common/interfaces/UserListFiltersInterface';

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
    ['copy_from_context', ['call.user.territory_id', 'territory_id']],
    ['copy_from_context', ['call.user.operator_id', 'operator_id']],
    [
      'has_permission_by_scope',
      [
        'user.list',
        [
          [
            'territory.users.list',
            'call.user.territory_id',
            'territory_id',
          ],
          [
            'operator.users.list',
            'call.user.operator_id',
            'operator_id'
          ],
        ],
      ],
    ],
    ['content.whitelist', [...whiteList.map((key: string) => `data.*.${key}`), 'meta.*']],
  ],
})
export class ListUserAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: UserContextInterface): Promise<ResultInterface> {
    const { operator_id, territory_id, ...pagination } = params;

    const data = await this.userRepository.list({ operator_id, territory_id}, pagination);

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
