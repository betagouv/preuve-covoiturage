import { Action as AbstractAction } from '@ilos/core';
import { handler, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/company/find.contract';
import { alias } from '../shared/monitoring/journeys/stats.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['can', ['monitoring.journeys.stats']],
  ],
})
export class JourneysStatsAction extends AbstractAction {
  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {}
}
