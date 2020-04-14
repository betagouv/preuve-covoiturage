import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/fraudcheck/check.contract';
import {
  signature as updateStatusSignature,
  ParamsInterface as UpdateStatusParamsInterface,
} from '../shared/carpool/updateStatus.contract';
import { CheckEngine } from '../engine/CheckEngine';
import { UncompletedTestException } from '../exceptions/UncompletedTestException';

/*
 * Start a check on an acquisition_id
 */
@handler({
  ...handlerConfig,
  middlewares: [['channel.service.except', ['proxy']]],
})
export class CheckAction extends Action {
  constructor(private engine: CheckEngine, private kernel: KernelInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    await this.engine.apply(params.acquisition_id, params.methods);
    await this.notifyScore(params.acquisition_id);
    return;
  }

  protected async notifyScore(acquisition_id: number): Promise<void> {
    try {
      const score = await this.engine.getGlobalScore(acquisition_id);
      if (score > 80) {
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
