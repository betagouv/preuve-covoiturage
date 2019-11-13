import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/list.contract';
import { alias } from '../shared/user/list.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
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
@handler(handlerConfig)
export class ListUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['user.list'],
        [
          (_params, context) => {
            if (context.call.user.territory_id) {
              return 'territory.users.list';
            }
          },
          (_params, context) => {
            if (context.call.user.operator_id) {
              return 'operator.users.list';
            }
          },
        ],
      ],
    ],
    ['content.whitelist', [...whiteList.map((key: string) => `data.*.${key}`), 'meta.*']],
  ];

  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: UserContextInterface): Promise<ResultInterface> {
    const contextParam: UserListFiltersInterface = {};

    if (context.call.user.territory_id) {
      contextParam.territory_id = context.call.user.territory_id;
    }

    if (context.call.user.operator_id) {
      contextParam.operator_id = context.call.user.operator_id;
    }

    const data = await this.userRepository.list(contextParam, params);

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
