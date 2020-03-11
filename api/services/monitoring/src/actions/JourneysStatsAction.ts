import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { alias } from '../shared/monitoring/journeys/stats.schema';
import { handlerConfig, ResultInterface } from '../shared/monitoring/journeys/stats.contract';
import { JourneyRepositoryProviderInterfaceResolver } from '../providers/JourneyRepositoryProvider';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['can', ['monitoring.journeysstats']],
  ],
})
export class JourneysStatsAction extends AbstractAction {
  constructor(private journeyRepository: JourneyRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    const acquired = await this.journeyRepository.acquiredJourneys();
    const acquired_failed = await this.journeyRepository.acquiredFailedJourneys();
    const carpools = await this.journeyRepository.allCarpools();
    const missing = await this.journeyRepository.missingCarpools();

    // TODO
    // - normalization errors

    return {
      pipeline: {
        acquired,
        acquired_failed,
        acquired_failed_ratio: this.round(acquired_failed / acquired, 5),
        carpools,
        missing,
        missing_ratio: this.round(missing / acquired),
        carpool_ratio: this.round(carpools / acquired),
      },
    };
  }

  private round(n: number, p = 3): number {
    return Math.round(n * Math.pow(10, p)) / Math.pow(10, p);
  }
}
