import { ConfigInterfaceResolver, handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/providers/middleware';
import { NormalizationProvider } from '@pdc/providers/normalization';
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

  public static killSwitch(
    timerSkip: boolean,
    commit: () => Promise<void>,
    timeout: number,
    runUUID: string,
  ): () => Promise<void> {
    return async () => {
      if (timerSkip) return;
      await commit();

      // kill the process if the timeout is reached
      // throwing cannot be catched by synchroneous try/catch block
      // as the setTimeout() runs outside the loop
      console.warn(`[acquisition:${runUUID}] timeout (${timeout}) -> exit`);
      process.exit(1);
    };
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

    const msg = `[acquisition:${runUUID}] processed (${acquisitions.length})`;
    console.debug(`[acquisition:${runUUID}] processing batch ${acquisitions.map((a) => a._id).join(', ')}`);
    console.time(msg);

    // We set a timeout to avoid the action to be stuck in case of error
    // and acquisitions to be locked forever
    let timerId: NodeJS.Timeout | null = null;

    // timerSkip is used to skip the timeout if the action is done before
    // and everything is commited
    const timerSkip = false;

    for (const acquisition of acquisitions) {
      // clear the timer on every loop and reset it
      timerId && clearTimeout(timerId);
      timerId = setTimeout(ProcessJourneyAction.killSwitch(timerSkip, commit, timeout, runUUID), timeout);

      try {
        // track how much time the action takes
        const timerMsg = `[acquisition:${runUUID}] processed (${acquisition._id}`;
        console.time(timerMsg);

        // Normalize geo, route and cost data
        console.debug(` >>> Normalise acquisition: ${acquisition._id}`);
        const normalizedAcquisition = await this.normalizer.handle(acquisition);

        // Cross check with carpool
        // This will create the entries in carpool.carpools and carpool.incentives
        //
        // ! WARNING !
        // The PG client cannot be passed to the crosscheck action because it is called
        // through the kernel.
        // The crosscheck action will run its own transaction to update the records.
        console.debug(` >>> Crosscheck: ${acquisition._id}`);
        await this.kernel.call<CrosscheckParamsInterface, CrosscheckResultInterface>(
          crosscheckSignature,
          normalizedAcquisition,
          callContext,
        );

        // Update the acquisition status
        console.debug(` >>> Update OK: ${acquisition._id}`);
        await update({
          acquisition_id: acquisition._id,
          status: AcquisitionStatusEnum.Ok,
        });
        console.timeEnd(timerMsg);
      } catch (e) {
        console.error(`[acquisition:${runUUID}] error ${e.message} processing ${acquisition._id}`);
        await update({
          acquisition_id: acquisition._id,
          status: AcquisitionStatusEnum.Error,
          error_stage: AcquisitionErrorStageEnum.Normalisation,
          errors: [e.message],
        });
        console.debug(` >>> Update FAILED: ${acquisition._id}`);
      }
    }

    await commit();
    console.timeEnd(msg);
    return acquisitions.length === batchSize;
  }
}
