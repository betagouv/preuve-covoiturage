import { Action } from '@ilos/core';
import { handler, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import { handlerConfig, signature, ParamsInterface, ResultInterface } from '../shared/fraudcheck/check.contract';
import { CheckEngine } from '../engine/CheckEngine';
import { FraudCheckRepositoryProviderInterfaceResolver, FraudCheckStatusEnum } from '../interfaces';

/*
 * Start check engine
 */
@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class CheckAction extends Action {
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
    if (params.acquisition_id) {
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
    for (const acquisition of acquisitions) {
      try {
        cb(await this.engine.run(acquisition, []));
      } catch (e) {
        console.debug(`[fraudcheck] error ${e.message} processing ${acquisition}`);
        cb({
          acquisition_id: acquisition,
          status: FraudCheckStatusEnum.Error,
          karma: 0,
          data: [],
        });
      }
    }
    await cb();
    console.timeEnd(msg);
    return;
  }
}
