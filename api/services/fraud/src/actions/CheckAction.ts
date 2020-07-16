import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/fraudcheck/check.contract';
import {
  signature as updateStatusSignature,
  ParamsInterface as UpdateStatusParamsInterface,
} from '../shared/carpool/updateStatus.contract';
import { CheckEngine } from '../engine/CheckEngine';
import { UncompletedTestException } from '../exceptions/UncompletedTestException';
import { FraudCheckRepositoryProviderInterfaceResolver, FraudCheckStatusEnum } from '../interfaces';

/*
 * Start a check on an acquisition_id
 */
@handler({
  ...handlerConfig,
  middlewares: [['channel.service.only', [handlerConfig.service]]],
})
export class CheckAction extends Action {
  constructor(
    private engine: CheckEngine,
    private kernel: KernelInterfaceResolver,
    private repository: FraudCheckRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const input = await this.repository.get(params.acquisition_id);
    const results = await this.engine.run(params.acquisition_id, input.data);
    await this.repository.createOrUpdate(results);

    if (results.status === FraudCheckStatusEnum.Done) {
      await this.notifyScore(params.acquisition_id, results.karma);
    }

    return;
  }

  protected async notifyScore(acquisition_id: number, score: number): Promise<void> {
    try {
      if (score > 0.8) {
        this.kernel.notify<UpdateStatusParamsInterface>(
          updateStatusSignature,
          {
            acquisition_id,
            status: 'fraudcheck_error',
          },
          {
            call: {
              user: {},
            },
            channel: {
              service: handlerConfig.service,
            },
          },
        );
      }
    } catch (e) {
      if (!(e instanceof UncompletedTestException)) {
        throw e;
      }
    }
  }
}
