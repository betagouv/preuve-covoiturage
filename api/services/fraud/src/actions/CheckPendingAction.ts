import { Action, env } from '@ilos/core';
import { handler, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import { handlerConfig, signature, ParamsInterface, ResultInterface } from '../shared/fraudcheck/checkPending.contract';
import { CheckEngine } from '../engine/CheckEngine';
import { FraudCheckRepositoryProviderInterfaceResolver, FraudCheckStatusEnum } from '../interfaces';

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

  async init(): Promise<void> {
    await this.kernel.notify<ParamsInterface>(signature, undefined, {
      call: {
        user: {},
      },
      channel: {
        service: handlerConfig.service,
        metadata: {
          repeat: {
            cron: '*/1 * * * *',
          },
          jobId: 'fraudcheck.check.cron',
        },
      },
    });
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (!!env('APP_DISABLE_FRAUDCHECK', false)) {
      return;
    }

    await this.repository.populate(params?.last_hours || 1);
    const { timeout, batchSize } = this.config.get('engine', {});
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
