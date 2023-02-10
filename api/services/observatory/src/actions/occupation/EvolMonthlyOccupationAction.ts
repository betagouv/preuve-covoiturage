import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { alias } from '../../shared/observatory/occupation/evolMonthlyOccupation.schema';
import {
  handlerConfig,
  ResultInterface,
  ParamsInterface,
} from '../../shared/observatory/occupation/evolMonthlyOccupation.contract';
import { OccupationRepositoryInterfaceResolver } from '../../interfaces/OccupationRepositoryProviderInterface';
import { limitNumberParamWithinRange } from '../../helpers/checkParams';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class EvolMonthlyOccupationAction extends AbstractAction {
  constructor(private repository: OccupationRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(params.year, 2020, new Date().getFullYear());
    return this.repository.getEvolMonthlyOccupation(params);
  }
}
