import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { alias } from '../shared/monitoring/journeystats.schema';
import { handlerConfig, ResultInterface, ParamsInterface } from '../shared/monitoring/journeystats.contract';
import { JourneyRepositoryProviderInterfaceResolver } from '../providers/JourneyRepositoryProvider';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias], hasPermissionMiddleware('registry.monitoring.journeysstats')],
})
export class JourneysStatsAction extends AbstractAction {
  constructor(private journeyRepository: JourneyRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const acquired = await this.journeyRepository.acquiredJourneys(params);
    const acquired_failed = await this.journeyRepository.acquiredFailedJourneys(params);
    const carpools = await this.journeyRepository.allCarpools(params);
    const missing = await this.journeyRepository.missingCarpools(params);
    const last_missing_by_date = await this.journeyRepository.missingCarpoolsByDate(params);
    // TODO
    // - normalization errors

    return {
      pipeline: {
        last_missing_by_date,
        acquired,
        acquired_failed,
        acquired_failed_ratio: this.round(acquired_failed / acquired, 5),
        carpools,
        missing,
        missing_ratio: this.round(missing / carpools),
        carpool_ratio: this.round(carpools / acquired),
      },
    };
  }

  private round(n: number, p = 3): number {
    return Math.round(n * Math.pow(10, p)) / Math.pow(10, p);
  }
}
