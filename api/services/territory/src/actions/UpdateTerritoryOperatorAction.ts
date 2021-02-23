import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

// eslint-disable-next-line
import { TerritoryOperatorRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryOperatorRepositoryProviderInterface';
import { configHandler, ParamsInterface, ResultInterface } from '../shared/territory/updateOperator.contract';
import { alias } from '../shared/territory/updateOperator.schema';

@handler({
  ...configHandler,
  middlewares: [
    [
      'has_permission_by_scope',
      [
        undefined,
        [
          [
            'operator.update',
            'call.user.operator_id',
            'operator_id',
          ],
        ],
      ],
    ],
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
