import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/carpool/find.contract';
import { alias } from '../shared/carpool/find.schema';
import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';

/*
 * Import journey in carpool database
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ['channel.service.only', ['acquisition', 'normalization', handlerConfig.service]],
    ['validate', alias],
  ],
})
export class FindAction extends Action {
  constructor(private carpool: CarpoolRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return this.carpool.find(params.acquisition_id);
  }
}
