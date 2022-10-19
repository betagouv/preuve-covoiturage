import { Action as AbstractAction } from '@ilos/core';
import { ConfigInterfaceResolver, handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { NormalizationProvider } from '@pdc/provider-normalization';

import {
  handlerConfig,
  signature as handlerSignature,
  ParamsInterface,
  ResultInterface,
} from '../shared/acquisition/process.contract';
import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider';
import {
  AcquisitionErrorStageEnum,
  AcquisitionFindInterface,
  AcquisitionStatusEnum,
} from '../interfaces/AcquisitionRepositoryProviderInterface';
import {
  ParamsInterface as CrosscheckParamsInterface,
  ResultInterface as CrosscheckResultInterface,
  signature as crosscheckSignature,
} from '../shared/carpool/crosscheck.contract';
import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';
import { PersonInterface } from '../shared/common/interfaces/PersonInterface';
import { callContext } from '../config/callContext';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class ProcessJourneyAction extends AbstractAction implements InitHookInterface {
  constructor(
    private repository: AcquisitionRepositoryProvider,
    private normalizer: NormalizationProvider,
    private kernel: KernelInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  async init(): Promise<void> {
    await this.kernel.notify<ParamsInterface>(handlerSignature, undefined, {
      call: {
        user: {},
      },
      channel: {
        service: handlerConfig.service,
        metadata: {
          repeat: {
            cron: '*/1 * * * *',
          },
          jobId: 'acquisition.process.cron',
        },
      },
    });
  }

  protected async handle(_params: ParamsInterface): Promise<ResultInterface> {
    const { timeout, batchSize } = this.config.get('acquisition.processing', {});
    const [acquisitions, cb] = await this.repository.findThenUpdate(
      {
        limit: batchSize,
        status: AcquisitionStatusEnum.Pending,
      },
      timeout,
    );
    const results = [];
    const msg = `[acquisition] processed (${acquisitions.length})`;
    console.debug(`Processing acquisition ${acquisitions.map((a) => a._id).join(', ')}`);
    console.time(msg);
    for (const acquisition of acquisitions) {
      try {
        const normalizedAcquisition = await this.normalize(acquisition);
        await this.kernel.call<CrosscheckParamsInterface, CrosscheckResultInterface>(
          crosscheckSignature,
          normalizedAcquisition,
          callContext,
        );
        results.push({
          acquisition_id: acquisition._id,
          status: AcquisitionStatusEnum.Ok,
        });
      } catch (e) {
        console.debug(`[acquisition] error ${e.message} processing ${acquisition._id}`);
        results.push({
          acquisition_id: acquisition._id,
          status: AcquisitionStatusEnum.Error,
          error_stage: AcquisitionErrorStageEnum.Normalisation,
          errors: [e],
        });
      }
    }
    await cb(results);
    console.timeEnd(msg);
    return;
  }

  protected async normalize(data: AcquisitionFindInterface<JourneyInterface>): Promise<CrosscheckParamsInterface> {
    const journey = {
      ...data.payload,
    };

    // driver AND/OR passenger
    if ('driver' in journey) journey.driver = this.normalizePerson(journey.driver, true);
    if ('passenger' in journey) journey.passenger = this.normalizePerson(journey.passenger, false);

    const normalizedData = await this.normalizer.handle({
      ...data,
      payload: journey,
    });

    return JSON.parse(JSON.stringify(normalizedData));
  }

  protected normalizePerson(person: PersonInterface, driver = false): PersonInterface {
    return {
      expense: 0,
      incentives: [],
      payments: [],
      ...person,
      is_driver: driver,
      seats: person && 'seats' in person ? person.seats : !driver ? 1 : 0,
    };
  }
}
