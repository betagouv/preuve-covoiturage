import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, NotFoundException } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/cancel.contract';
import {
  signature as updateStatusSignature,
  ParamsInterface as UpdateStatusParams,
} from '../shared/carpool/updateStatus.contract';
import { alias } from '../shared/acquisition/cancel.schema';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';

const callContext = {
  channel: {
    service: 'acquisition',
  },
  call: {
    user: {},
  },
};

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['journey.create']],
    ['validate', alias],
  ],
})
export class CancelJourneyAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private journeyRepository: JourneyRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // Store in database
    const { operator_id } = context.call.user;
    try {
      const { _id: acquisition_id } = await this.journeyRepository.exists(params.journey_id, operator_id);
      // Perform cancelling action :)
      await this.kernel.notify<UpdateStatusParams>(
        updateStatusSignature,
        { acquisition_id, status: 'canceled' },
        callContext,
      );
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw new NotFoundException(`Journey ${params.journey_id} doest not exist`);
      }
      throw e;
    }
  }
}
