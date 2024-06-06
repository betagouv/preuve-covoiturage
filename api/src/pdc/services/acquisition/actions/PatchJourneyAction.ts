import _ from 'lodash';
import { Action as AbstractAction, env } from '@/ilos/core/index.ts';
import { handler, ContextType } from '@/ilos/common/index.ts';
import { hasPermissionMiddleware } from '@/pdc/providers/middleware/index.ts';
import { CarpoolAcquisitionService } from '@/pdc/providers/carpool/index.ts';
import { OperatorClass } from '@/pdc/providers/carpool/interfaces/index.ts';

import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/acquisition/patch.contract.ts';

import { alias } from '@/shared/acquisition/patch.schema.ts';

import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider.ts';
import { AcquisitionStatusEnum } from '../interfaces/AcquisitionRepositoryProviderInterface.ts';

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
    const operator_id = _.get(context, 'call.user.operator_id');
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
