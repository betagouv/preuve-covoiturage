import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryOperatorRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryOperatorRepositoryProviderInterface';
import { configHandler, ParamsInterface, ResultInterface } from '../shared/territory/listOperator.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/territory/listOperator.schema';

@handler(configHandler)
export class ListTerritoryOperatorAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['scopeIt',
      [
        ['this.is.not.a.valid.permission'],
        [
          (params, context) => {
            if ('operator_id' in params && params.operator_id === context.call.user.operator_id) {
              return 'operator.read';
            }
          },
        ],
        [
          (params, context) => {
            if ('territory_id' in params && params.territory_id === context.call.user.territory_id) {
              return 'territory.read';
            }
          },
        ]
      ],
    ],
    ['validate', alias],
  ];

  constructor(private territoryRepository: TerritoryOperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (params.territory_id) {
      return await this.territoryRepository.findByTerritory(params.territory_id);
    } else if (params.operator_id) {
      return await this.territoryRepository.findByOperator(params.operator_id);
    }
    return [];
  }
}
