import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { handler } from '@/ilos/common/index.ts';
import { hasPermissionMiddleware } from '@/pdc/providers/middleware/index.ts';

import { alias } from '@/shared/observatory/distribution/journeysByHours.schema.ts';
import {
  handlerConfig,
  ResultInterface,
  ParamsInterface,
} from '@/shared/observatory/distribution/journeysByHours.contract.ts';
import { DistributionRepositoryInterfaceResolver } from '../../interfaces/DistributionRepositoryProviderInterface.ts';
import { limitNumberParamWithinRange } from '../../helpers/checkParams.ts';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class JourneysByHoursAction extends AbstractAction {
  constructor(private repository: DistributionRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(params.year, 2020, new Date().getFullYear());
    return this.repository.getJourneysByHours(params);
  }
}
