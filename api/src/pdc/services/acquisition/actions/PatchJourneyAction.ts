import { get } from 'lodash';
import { Action as AbstractAction, env } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/providers/middleware';
import { CarpoolAcquisitionService } from '@pdc/providers/carpool';
import { OperatorClass } from '@pdc/providers/carpool/interfaces';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/acquisition/patch.contract';

import { alias } from '@shared/acquisition/patch.schema';

import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider';
import { AcquisitionStatusEnum } from '../interfaces/AcquisitionRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias], hasPermissionMiddleware('operator.acquisition.create')],
})
export class PatchJourneyAction extends AbstractAction {
  constructor(
    private repository: AcquisitionRepositoryProvider,
    private acquisitionService: CarpoolAcquisitionService,
  ) {
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
    if (env.or_false('APP_ENABLE_CARPOOL_V2')) {
      const toUpdate = {
        ...params,
        ...(params.operator_class ? { operator_class: OperatorClass[params.operator_class] } : {}),
      };

      await this.acquisitionService.updateRequest({
        ...toUpdate,
        api_version: 3,
        operator_id,
        operator_journey_id: params.operator_journey_id,
      });
    }
  }
}
