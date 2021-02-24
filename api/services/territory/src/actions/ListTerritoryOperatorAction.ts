import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

// eslint-disable-next-line
import { TerritoryOperatorRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryOperatorRepositoryProviderInterface';
import { configHandler, ParamsInterface, ResultInterface } from '../shared/territory/listOperator.contract';
import { alias } from '../shared/territory/listOperator.schema';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware/dist';

@handler({
  ...configHandler,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: 'registry.territory.listOperator',
      operator: 'operator.territory.listOperator',
      territory: 'territory.territory.listOperator',
    }),
    ['validate', alias],
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
