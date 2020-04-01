import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { alias } from '../shared/acquisition/status.schema';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/status.contract';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';
import { ErrorRepositoryProviderInterfaceResolver } from '../interfaces/ErrorRepositoryProviderInterface';
import { CarpoolRepositoryInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['journey.create']],
    ['validate', alias],
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
    const { journey_id } = params;
    const operator_id = get(context, 'call.user.operator_id', 0);

    /**
     * 1. check acquisition
     * 2. check carpool if found
     * 3. check errors on failure
     */

    try {
      const acq = await this.acquisitionRepository.findForOperator(journey_id, operator_id);

      try {
        const carpoolStatus = await this.carpoolRepository.status({
          operator_id,
          journey_id,
          acquisition_id: acq._id,
        });

        // handles statuses : ok | expired | canceled
        return {
          status: carpoolStatus,
          journey_id,
          created_at: acq.created_at,
        };
      } catch (eCarpool) {
        return {
          status: 'pending',
          journey_id,
          created_at: acq.created_at,
        };
      }
    } catch (eAcquisition) {
      // look for the submission in the error table
      const err = await this.errorRepository.find(params);

      return {
        status: err.error_message || 'error', // TODO improve
        journey_id,
        created_at: err.created_at,
      };
    }
  }
}
