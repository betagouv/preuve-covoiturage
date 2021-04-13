/**
 * #### CancelJourneyAction
 *
 * - signature: `acquisition:cancel`
 * - permissions: `['journey.create']`
 *
 * Cancel a stored journey from `carpool.carpools` table by setting the status to `canceled`.
 */
import { Action as AbstractAction } from '@ilos/core';
import { handler, KernelInterfaceResolver, NotFoundException } from '@ilos/common';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';

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
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({ operator: 'operator.acquisition.cancel' }),
  ],
})
export class CancelJourneyAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private journeyRepository: JourneyRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: ParamsInterface): Promise<ResultInterface> {
    // Store in database
    const journeyData = await this.journeyRepository.exists(params.journey_id, params.operator_id);
    if (!journeyData) {
      throw new NotFoundException(`Journey ${params.journey_id} does not exist`);
    }

    // Perform cancelling action :)
    await this.kernel.notify<UpdateStatusParams>(
      updateStatusSignature,
      { acquisition_id: journeyData._id, status: 'canceled' },
      callContext,
    );
  }
}
