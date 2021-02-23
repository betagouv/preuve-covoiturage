import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

// eslint-disable-next-line
import { TerritoryOperatorRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryOperatorRepositoryProviderInterface';
import { configHandler, ParamsInterface, ResultInterface } from '../shared/territory/listOperator.contract';
import { alias } from '../shared/territory/listOperator.schema';

@handler({
  ...configHandler,
  middlewares: [
    ['validate', alias],
    [
      'has_permission_by_scope',
      [
        undefined,
        [
          [
            'operator.read',
            'call.user.operator_id',
            'operator_id',
          ],
          [
            'territory.read',
            'call.user.territory_id',
            'territory_id',
          ],
        ],
      ],
    ],
  ],
})
export class ListTerritoryOperatorAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryOperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (params.territory_id) {
      return this.territoryRepository.findByTerritory(params.territory_id);
    }
    if (params.operator_id) {
      return this.territoryRepository.findByOperator(params.operator_id);
    }
    return [];
  }
}
