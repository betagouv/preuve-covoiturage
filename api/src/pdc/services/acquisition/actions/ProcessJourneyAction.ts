import {
  ConfigInterfaceResolver,
  handler,
  KernelInterfaceResolver,
} from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { internalOnlyMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { NormalizationProvider } from "@/pdc/providers/normalization/index.ts";

import { getPerformanceTimer, logger } from "@/lib/logger/index.ts";
import { v4 } from "@/lib/uuid/index.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/acquisition/process.contract.ts";
import {
  ParamsInterface as CrosscheckParamsInterface,
  ResultInterface as CrosscheckResultInterface,
  signature as crosscheckSignature,
} from "@/shared/carpool/crosscheck.contract.ts";
import { callContext } from "../config/callContext.ts";
import {
  AcquisitionErrorStageEnum,
  AcquisitionStatusEnum,
} from "../interfaces/AcquisitionRepositoryProviderInterface.ts";
import { AcquisitionRepositoryProvider } from "../providers/AcquisitionRepositoryProvider.ts";

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
    const runUUID = v4();
    const { timeout, batchSize } = this.config.get("acquisition.processing", {
      timeout: 0,
      batchSize: 1000,
    });

    // Get a batch of acquisitions to process, lock them and get a pg client instance
    // to be keep the transaction alive
    const [acquisitions, update, commit] = await this.repository.findThenUpdate(
      {
        limit: batchSize,
        status: AcquisitionStatusEnum.Pending,
      },
    );

    logger.debug(
      `[acquisition:${runUUID}] processing batch ${
        acquisitions.map((a) => a._id).join(", ")
      }`,
    );
    const timer = getPerformanceTimer();

    // We set a timeout to avoid the action to be stuck in case of error
    // and acquisitions to be locked forever
    let timerId: NodeJS.Timeout | null = null;
    const failed = [];

    for (const acquisition of acquisitions) {
      // clear the timer on every loop and reset it
      timerId && clearTimeout(timerId);
      timerId = setTimeout(async () => {
        logger.error(`[acquisition:${runUUID}] timeout ${acquisition._id}`);
        await update({
          acquisition_id: acquisition._id,
          status: AcquisitionStatusEnum.Error,
          error_stage: AcquisitionErrorStageEnum.Normalisation,
          errors: ["Timeout"],
        });
        failed.push(acquisition._id);
        logger.debug(` >>> Update TIMED OUT: ${acquisition._id}`);
      }, timeout);

      try {
        // track how much time the action takes
        const subtimer = getPerformanceTimer();

        // Normalize geo, route and cost data
        logger.debug(` >>> Normalise acquisition: ${acquisition._id}`);
        const normalizedAcquisition = await this.normalizer.handle(acquisition);

        // Cross check with carpool
        // This will create the entries in carpool.carpools and carpool.incentives
        //
        // ! WARNING !
        // The PG client cannot be passed to the crosscheck action because it is called
        // through the kernel.
        // The crosscheck action will run its own transaction to update the records.
        logger.debug(` >>> Crosscheck: ${acquisition._id}`);
        await this.kernel.call<
          CrosscheckParamsInterface,
          CrosscheckResultInterface
        >(
          crosscheckSignature,
          normalizedAcquisition,
          callContext,
        );

        // Update the acquisition status
        if (!failed.includes(acquisition._id)) {
          logger.debug(` >>> Update OK: ${acquisition._id}`);
          await update({
            acquisition_id: acquisition._id,
            status: AcquisitionStatusEnum.Ok,
          });
        }
        const subperformance = subtimer.stop();
        logger.info(
          `[acquisition:${runUUID}] processed (${acquisition._id} in ${subperformance} ms`,
        );
      } catch (e) {
        logger.error(
          `[acquisition:${runUUID}] error ${e.message} processing ${acquisition._id}`,
        );
        await update({
          acquisition_id: acquisition._id,
          status: AcquisitionStatusEnum.Error,
          error_stage: AcquisitionErrorStageEnum.Normalisation,
          errors: [e.message],
        });
        logger.debug(` >>> Update FAILED: ${acquisition._id}`);
      } finally {
        timerId && clearTimeout(timerId);
      }
    }

    await commit();
    const performance = timer.stop();
    logger.info(
      `[acquisition:${runUUID}] processed (${acquisitions.length}) in ${performance} ms`,
    );
    return acquisitions.length === batchSize;
  }
}
