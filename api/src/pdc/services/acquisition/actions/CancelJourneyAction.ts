import { Action as AbstractAction, env } from '@ilos/core';
import { handler, KernelInterfaceResolver, NotFoundException } from '@ilos/common';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/providers/middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/acquisition/cancel.contract';
import {
  signature as updateStatusSignature,
  ParamsInterface as UpdateStatusParams,
} from '@shared/carpool/updateStatus.contract';
import { alias } from '@shared/acquisition/cancel.schema';
import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider';
import { callContext } from '../config/callContext';
import { StatusEnum } from '@shared/acquisition/status.contract';
import { CarpoolAcquisitionService } from '@pdc/providers/carpool';

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
    private repository: AcquisitionRepositoryProvider,
    private acquisitionService: CarpoolAcquisitionService,
  ) {
    super();
  }

  protected async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { operator_id, operator_journey_id } = params;

    // Store in database
    const acquisition = await this.repository.getStatus(operator_id, operator_journey_id);
    if (!acquisition) {
      throw new NotFoundException(`Journey ${operator_journey_id} does not exist`);
    }

    if ([StatusEnum.Ok, StatusEnum.FraudError].indexOf(acquisition.status) < 0) {
      throw new NotFoundException(`Journey ${operator_journey_id} is not cancelable`);
    }

    await this.repository.cancel(operator_id, operator_journey_id, params.code, params.message);

    // Perform cancelling action :)
    await this.kernel.call<UpdateStatusParams>(
      updateStatusSignature,
      { acquisition_id: acquisition._id, status: 'canceled' },
      callContext,
    );

    if (env.or_false('APP_ENABLE_CARPOOL_V2')) {
      await this.acquisitionService.cancelRequest({
        api_version: 3,
        operator_id,
        operator_journey_id,
        cancel_code: params.code,
        cancel_message: params.message,
      });
    }
  }
}
