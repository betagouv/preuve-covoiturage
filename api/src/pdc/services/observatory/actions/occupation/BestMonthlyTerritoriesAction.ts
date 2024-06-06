import { Action as AbstractAction } from '/ilos/core/index.ts';
import { handler } from '/ilos/common/index.ts';
import { hasPermissionMiddleware } from '/pdc/providers/middleware/index.ts';

import { alias } from '/shared/observatory/occupation/bestMonthlyTerritories.schema.ts';
import {
  handlerConfig,
  ResultInterface,
  ParamsInterface,
} from '/shared/observatory/occupation/bestMonthlyTerritories.contract.ts';
import { OccupationRepositoryInterfaceResolver } from '../../interfaces/OccupationRepositoryProviderInterface.ts';
import { limitNumberParamWithinRange } from '../../helpers/checkParams.ts';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class BestMonthlyTerritoriesAction extends AbstractAction {
  constructor(private repository: OccupationRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(params.year, 2020, new Date().getFullYear());
    return this.repository.getBestMonthlyTerritories(params);
  }
}
