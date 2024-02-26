import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/acquisition/patch.contract';

import { alias } from '@shared/acquisition/patch.schema';

import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider';
import { AcquisitionStatusEnum } from '../interfaces/AcquisitionRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias], hasPermissionMiddleware('operator.acquisition.create')],
})
export class PatchJourneyAction extends AbstractAction {
  constructor(private repository: AcquisitionRepositoryProvider) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const operator_id = get(context, 'call.user.operator_id');
    await this.repository.patchPayload(
      {
        operator_id,
        operator_journey_id: params.operator_journey_id,
        status: [AcquisitionStatusEnum.Pending, AcquisitionStatusEnum.Error],
      },
      params,
    );
  }
}
