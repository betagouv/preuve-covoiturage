import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/status.contract';
import { alias } from '../shared/acquisition/status.schema';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';
import { ErrorRepositoryProviderInterfaceResolver } from '../interfaces/ErrorRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['journey.status']],
    ['validate', alias],
  ],
})
export class StatusAction extends AbstractAction {
  private providers = [];

  constructor(
    private kernel: KernelInterfaceResolver,
    private acqRepo: JourneyRepositoryProviderInterfaceResolver,
    private errRepo: ErrorRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // find acquisition
    // make sure it belongs to the right operator --> scopeIt
    // MIGRATE add index on acq operator_id
    // MIGRATE add index on acq journey_id
    // MIGRATE add column journey_id and request_id on acq.errors + indexes
    // log journey_id in logerror (see repo)

    // fetch from acquisition. Might throw a 404 if not found
    // TODO get operator_id from context
    console.log({ context });

    try {
      const acq = await this.acqRepo.find(params);

      await this.kernel.call(
        'carpool:find',
        { acquisition_id: acq._id },
        { ...context, ...{ channel: { service: 'acquisition' } } },
      );

      // journey did it through carpools
      return {
        journey_id: params.journey_id,
        status: 'ok',
      };
    } catch (e) {
      // look for the submission in the error table
      const err = await this.errRepo.find(params);
      console.log({ err });

      return {
        journey_id: params.journey_id,
        status: err.error_message, // TODO improve
      };
    }

    //
  }

  /**
  acq.find --> acquisition_id || 404
  carpool(acquisition_id)
    ok : ok
    ko : acq.err(journey_id)
      ok : type error
      ko : 404 ? 500 ? --> notify administrators
*/
  // const status = [
  //   "acquisition_error", // received but not saved due to acquisition error
  //   "waiting_normalization", // received, waiting for processing
  //   "normalization_error", // processing error
  //   "waiting_fraudcheck"  // processed, waiting for fraudcheck
  //   "fraudcheck_error", // fraudcheck detected
  //   "canceled", // cancelled by operator
  //   "ok", // evrything is ok :)
  // ]
}
