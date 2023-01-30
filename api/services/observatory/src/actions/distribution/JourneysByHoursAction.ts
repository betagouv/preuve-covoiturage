import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { alias } from '../../shared/observatory/distribution/journeysByHours.schema';
import {
  handlerConfig,
  ResultInterface,
  ParamsInterface,
} from '../../shared/observatory/distribution/journeysByHours.contract';
import { DistributionRepositoryInterfaceResolver } from '../../interfaces/DistributionRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class JourneysByHoursAction extends AbstractAction {
  constructor(private repository: DistributionRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.repository.getJourneysByHours(params);
  }
}
