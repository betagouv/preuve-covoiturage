import { Action as AbstractAction } from '@ilos/core/index.ts';
import { handler } from '@ilos/common/index.ts';
import { contentWhitelistMiddleware, copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/providers/middleware/index.ts';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/user/list.contract.ts';
import { alias } from '@shared/user/list.schema.ts';
import { UserContextInterface } from '@shared/user/common/interfaces/UserContextInterfaces.ts';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface.ts';

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

    const p: { operator_id?: number; territory_id?: number; hidden?: boolean } = {};
    if (typeof operator_id !== 'undefined') p.operator_id = operator_id;
    if (typeof territory_id !== 'undefined') p.territory_id = territory_id;
    if (p.operator_id || p.territory_id) p.hidden = false;

    const data = await this.userRepository.list(p, pagination);

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
