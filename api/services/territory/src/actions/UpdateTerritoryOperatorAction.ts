import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { TerritoryOperatorRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryOperatorRepositoryProviderInterface';
import { configHandler, ParamsInterface, ResultInterface } from '../shared/territory/updateOperator.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/territory/updateOperator.schema';

@handler(configHandler)
export class UpdateTerritoryOperatorAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    [
      'scopeIt',
      [
        ['this.is.not.a.valid.permission'],
        [
          (params, context) => {
            if ('operator_id' in params && params.operator_id === context.call.user.operator_id) {
              return 'operator.update';
            }
          },
        ],
      ],
    ],
    ['validate', alias],
  ];

  constructor(private territoryRepository: TerritoryOperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.territoryRepository.updateByOperator(params.operator_id, params.territory_id);
  }
}
