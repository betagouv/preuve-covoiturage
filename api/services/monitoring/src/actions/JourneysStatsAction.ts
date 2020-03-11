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
    const carpools = await this.journeyRepository.allCarpools();
    const missing = await this.journeyRepository.missingCarpools();

    return {
      pipeline: {
        acquired,
        carpools,
        missing,
        missing_ratio: Math.round((missing / acquired) * 100 * 1000) / 1000,
      },
    };
  }
}
