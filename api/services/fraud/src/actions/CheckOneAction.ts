import { Action } from '@ilos/core';
import { handler } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/fraudcheck/checkOne.contract';
import { CheckEngine } from '../engine/CheckEngine';
import { FraudCheckRepositoryProviderInterfaceResolver } from '../interfaces';

/*
 * Start check engine
 */
@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class CheckOneAction extends Action {
  constructor(
    private engine: CheckEngine,
    private repository: FraudCheckRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    try {
      console.debug(`[fraudcheck] start processing ${params.acquisition_id}`);
      const result = await this.engine.run(params.acquisition_id, []);
      await this.repository.createOrUpdate(result);
      console.debug(`[fraudcheck] done processing ${params.acquisition_id}`);
      return;
    } catch (e) {
      console.debug(`[fraudcheck] error processing ${params.acquisition_id}`);
      console.debug(e);
      throw e;
    }
  }
}
