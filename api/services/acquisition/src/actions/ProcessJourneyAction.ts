import { ConfigInterfaceResolver, handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { NormalizationProvider } from '@pdc/provider-normalization';
import { randomUUID } from 'crypto';

import { callContext } from '../config/callContext';
import { AcquisitionErrorStageEnum, AcquisitionStatusEnum } from '../interfaces/AcquisitionRepositoryProviderInterface';
import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/process.contract';
import {
  ParamsInterface as CrosscheckParamsInterface,
  ResultInterface as CrosscheckResultInterface,
  signature as crosscheckSignature,
} from '../shared/carpool/crosscheck.contract';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class ProcessJourneyAction extends AbstractAction {
  constructor(
    private repository: AcquisitionRepositoryProvider,
    private normalizer: NormalizationProvider,
    private kernel: KernelInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  protected async handle(_params: ParamsInterface): Promise<ResultInterface> {
    const runUUID = randomUUID();
    const { timeout, batchSize } = this.config.get('acquisition.processing', { timeout: 0, batchSize: 100 });
    const [acquisitions, cb] = await this.repository.findThenUpdate(
      {
        limit: batchSize,
        status: AcquisitionStatusEnum.Pending,
      },
      timeout,
    );
    const msg = `[acquisition] processed (${acquisitions.length}) *${runUUID}*`;
    console.debug(`[acquisition] processing batch ${acquisitions.map((a) => a._id).join(', ')} *${runUUID}*`);
    console.time(msg);
    try {
      for (const acquisition of acquisitions) {
        const timerMsg = `[acquisition] processed (${acquisition._id} *${runUUID}*`;
        console.time(timerMsg);
        try {
          const normalizedAcquisition = await this.normalizer.handle(acquisition);
          await this.kernel.call<CrosscheckParamsInterface, CrosscheckResultInterface>(
            crosscheckSignature,
            normalizedAcquisition,
            callContext,
          );
          await cb({
            acquisition_id: acquisition._id,
            status: AcquisitionStatusEnum.Ok,
          });
        } catch (e) {
          console.debug(`[acquisition] error ${e.message} processing ${acquisition._id} *${runUUID}`);
          await cb({
            acquisition_id: acquisition._id,
            status: AcquisitionStatusEnum.Error,
            error_stage: AcquisitionErrorStageEnum.Normalisation,
            errors: [e],
          });
        } finally {
          console.timeEnd(timerMsg);
        }
      }
    } finally {
      await cb();
      console.timeEnd(msg);
    }
    return;
  }
}
