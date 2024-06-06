import { Action as AbstractAction } from '/ilos/core/index.ts';
import { handler, NotFoundException } from '/ilos/common/index.ts';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '/pdc/providers/middleware/index.ts';

import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider.ts';
import { alias } from '/shared/acquisition/status.schema.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '/shared/acquisition/status.contract.ts';

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
      anomaly_error_details: acquisition.anomaly_error_details,
    };
  }
}
