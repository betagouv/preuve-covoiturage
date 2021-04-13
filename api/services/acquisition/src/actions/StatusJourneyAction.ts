import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, NotFoundException } from '@ilos/common';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';

import { alias } from '../shared/acquisition/status.schema';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/status.contract';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';
import { ErrorRepositoryProviderInterfaceResolver } from '../interfaces/ErrorRepositoryProviderInterface';
import { CarpoolRepositoryInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({ operator: 'operator.acquisition.status' }),
  ],
})
export class StatusJourneyAction extends AbstractAction {
  constructor(
    private acquisitionRepository: JourneyRepositoryProviderInterfaceResolver,
    private errorRepository: ErrorRepositoryProviderInterfaceResolver,
    private carpoolRepository: CarpoolRepositoryInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const { journey_id, operator_id } = params;

    const acquisition = await this.acquisitionRepository.exists(journey_id, operator_id);
    const errors = (await this.errorRepository.findByJourneyAndOperator(journey_id, operator_id)).filter(
      (e) => !e.error_resolved,
    );
    const carpool = await this.carpoolRepository.getStatusByAcquisitionId(acquisition?._id);

    const acquisitionError = errors.find((e) => e.error_stage === 'acquisition');
    const normalizationError = errors.find((e) => e.error_stage === 'normalization');
    const otherError = errors.find((e) => ['acquisition', 'normalization'].indexOf(e.error_stage) < 0);

    const state = `${acquisition ? '1' : '0'}${carpool ? '1' : '0'}${
      !errors.length ? '0' : acquisitionError ? '1' : normalizationError ? '3' : '7'
    }`;

    switch (state) {
      // no acquisition and no errors = Not found
      case '000':
        throw new NotFoundException();

      // no acquisition and acquisition error
      case '001':
        return {
          status: `${acquisitionError.error_stage}_error`,
          journey_id,
          created_at: acquisitionError.created_at,
          metadata: {
            message: acquisitionError.error_message,
          },
        };

      // acquisition ok and carpool ok
      case '110':
        return {
          status: carpool,
          journey_id,
          created_at: acquisition.created_at,
        };

      // acquired, no carpool and no errors = Pending
      case '100':
        return {
          status: 'pending',
          journey_id,
          created_at: acquisition.created_at,
        };

      // acquired, no carpool and normalization error
      case '103':
        return {
          status: `${normalizationError.error_stage}_error`,
          journey_id,
          created_at: normalizationError.created_at,
          metadata: {
            message: normalizationError.error_message,
          },
        };

      // other errors
      case '007':
      case '107':
        return {
          status: `${otherError.error_stage}_error`,
          journey_id,
          created_at: otherError.created_at,
          metadata: {
            message: otherError.error_message,
          },
        };

      // no acquisition, no carpool and normalization error
      case '003':
      // no acquisition and carpool = not possible
      case '010':
      case '011':
      case '013':
      case '017':
      // acquisition and acquisition error = not possible
      case '101':
      // acquisition ok, carpool ok but still unresolved errors
      case '111':
      case '113':
      case '117':
        throw new Error(`Status system error (${state})`);

      default:
        throw new Error('Status system error');
    }
  }
}
