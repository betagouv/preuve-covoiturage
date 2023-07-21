import { Action as AbstractAction } from '@ilos/core';
import { handler, NotFoundException } from '@ilos/common';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';

import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider';
import { alias } from '../shared/acquisition/status.schema';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/status.contract';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({ operator: 'operator.acquisition.status' }),
  ],
})
export class StatusJourneyAction extends AbstractAction {
  constructor(private acquisitionRepository: AcquisitionRepositoryProvider) {
    super();
  }

  protected async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { operator_journey_id, operator_id } = params;

    const acquisition = await this.acquisitionRepository.getStatus(operator_id, operator_journey_id);
    if (!acquisition) {
      throw new NotFoundException();
    }

    return {
      operator_journey_id,
      status: acquisition.status,
      created_at: acquisition.created_at,
      fraud_error_labels: acquisition.fraud_error_labels,
    };
  }
}
