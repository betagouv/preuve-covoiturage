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
      'scopeIt',
      [
        ['this.is.not.a.valid.permission'],
        [
          (params, context): string => {
            if ('operator_id' in params && params.operator_id === context.call.user.operator_id) {
              return 'operator.update';
            }
          },
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
