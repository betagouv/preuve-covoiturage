import { ConfigInterfaceResolver, KernelInterfaceResolver, handler } from '@ilos/common';
import { Action, env } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import { CheckEngine } from '../engine/CheckEngine';
import { FraudCheckRepositoryProviderInterfaceResolver, FraudCheckStatusEnum } from '../interfaces';
import { ParamsInterface, ResultInterface, handlerConfig } from '../shared/fraudcheck/checkPending.contract';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class CheckPendingAction extends Action {
  constructor(
    private engine: CheckEngine,
    private kernel: KernelInterfaceResolver,
    private repository: FraudCheckRepositoryProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (env.or_false('APP_DISABLE_FRAUDCHECK')) {
      return;
    }

    await this.repository.populate(params?.last_hours || 1);
    const { timeout, batchSize } = this.config.get('engine', { timeout: 0, batchSize: 100 });
    const [acquisitions, cb] = await this.repository.findThenUpdate(
      {
        limit: batchSize,
        status: FraudCheckStatusEnum.Pending,
      },
      timeout,
    );

    const msg = `[fraudcheck] processed (${acquisitions.length})`;
    console.debug(`Processing fraudcheck ${acquisitions.join(', ')}`);
    console.time(msg);
    try {
      for (const acquisition of acquisitions) {
        try {
          const result = await this.engine.run(acquisition, []);
          await cb(result);
        } catch (e) {
          console.debug(`[fraudcheck] error ${e.message} processing ${acquisition}`);
          await cb({
            acquisition_id: acquisition,
            status: FraudCheckStatusEnum.Error,
            karma: 0,
            data: [],
          });
        }
      }
    } finally {
      await cb();
      console.timeEnd(msg);
    }
    return;
  }
}
