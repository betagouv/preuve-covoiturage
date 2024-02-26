import { ConfigInterfaceResolver, handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { NormalizationProvider } from '@pdc/provider-normalization';
import { randomUUID } from 'crypto';

import { callContext } from '../config/callContext';
import { AcquisitionErrorStageEnum, AcquisitionStatusEnum } from '../interfaces/AcquisitionRepositoryProviderInterface';
import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/acquisition/process.contract';
import {
  ParamsInterface as CrosscheckParamsInterface,
  ResultInterface as CrosscheckResultInterface,
  signature as crosscheckSignature,
} from '@shared/carpool/crosscheck.contract';

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
    const { timeout, batchSize } = this.config.get('acquisition.processing', { timeout: 0, batchSize: 1000 });

    // Get a batch of acquisitions to process, lock them and get a pg client instance
    // to be keep the transaction alive
    const [acquisitions, update, commit] = await this.repository.findThenUpdate({
      limit: batchSize,
      status: AcquisitionStatusEnum.Pending,
    });

    const msg = `[acquisition] processed (${acquisitions.length}) *${runUUID}*`;
    console.debug(`[acquisition] processing batch ${acquisitions.map((a) => a._id).join(', ')} *${runUUID}*`);
    console.time(msg);

    // We set a timeout to avoid the action to be stuck in case of error
    // and acquisitions to be locked forever
    let timerId: NodeJS.Timeout | null = null;

    // timerSkip is used to skip the timeout if the action is done before
    // and everything is commited
    const timerSkip = false;

    try {
      for (const acquisition of acquisitions) {
        // clear the timer on every loop and reset it
        timerId && clearTimeout(timerId);
        timerId = setTimeout(async () => {
          if (timerSkip) return;
          console.warn(`[acquisition] timeout processing escape commit *${runUUID}*`);
          await commit();
        }, timeout);

        // track how much time the action takes
        const timerMsg = `[acquisition] processed (${acquisition._id} *${runUUID}*`;
        console.time(timerMsg);

        try {
          // Normalize geo, route and cost data
          const normalizedAcquisition = await this.normalizer.handle(acquisition);

          // Cross check with carpool
          // This will create the entries in carpool.carpools and carpool.incentives
          //
          // ! WARNING !
          // The PG client cannot be passed to the crosscheck action because it is called
          // through the kernel.
          // The crosscheck action will run its own transaction to update the records.
          await this.kernel.call<CrosscheckParamsInterface, CrosscheckResultInterface>(
            crosscheckSignature,
            normalizedAcquisition,
            callContext,
          );

          // Update the acquisition status
          await update({
            acquisition_id: acquisition._id,
            status: AcquisitionStatusEnum.Ok,
          });
        } catch (e) {
          console.debug(`[acquisition] error ${e.message} processing ${acquisition._id} *${runUUID}`);
          await update({
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
      await commit();
      console.timeEnd(msg);
    }
  }
}
