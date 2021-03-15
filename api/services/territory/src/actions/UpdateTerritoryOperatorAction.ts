import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionByScopeMiddleware } from '@pdc/provider-middleware';

// eslint-disable-next-line
import { TerritoryOperatorRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryOperatorRepositoryProviderInterface';
import { configHandler, ParamsInterface, ResultInterface } from '../shared/territory/updateOperator.contract';
import { alias } from '../shared/territory/updateOperator.schema';

// TOTO : MIDDLEWARE
@handler({
  ...configHandler,
  middlewares: [
    hasPermissionByScopeMiddleware(undefined, ['operator.territory.update', 'call.user.operator_id', 'operator_id']),
    ['validate', alias],
  ],
})
export class UpdateTerritoryOperatorAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryOperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.territoryRepository.updateByOperator(params.operator_id, params.territory_id);
  }
}
