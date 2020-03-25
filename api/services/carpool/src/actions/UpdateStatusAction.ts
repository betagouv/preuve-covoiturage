import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/carpool/updateStatus.contract';
import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';

/*
 * Import journey in carpool database
 */
@handler({
  ...handlerConfig,
  middlewares: [['channel.service.only', ['acquisition']]],
})
export class CrosscheckAction extends Action {
  constructor(private carpool: CarpoolRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle({ acquisition_id, status }: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    await this.carpool.updateStatus(acquisition_id, status);
  }
}
