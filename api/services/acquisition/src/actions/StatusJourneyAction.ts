import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, NotFoundException } from '@ilos/common';

import { alias } from '../shared/acquisition/status.schema';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/status.contract';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';
import { ErrorRepositoryProviderInterfaceResolver } from '../interfaces/ErrorRepositoryProviderInterface';
import { CarpoolRepositoryInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';
import { AcquisitionInterface } from '../shared/acquisition/common/interfaces/AcquisitionInterface';
import { AcquisitionErrorInterface } from '../shared/acquisition/common/interfaces/AcquisitionErrorInterface';

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

    let acquisition: AcquisitionInterface;
    let error: AcquisitionErrorInterface;
    let carpool: string;

    // fetch all states
    try {
      acquisition = await this.acquisitionRepository.findForOperator(journey_id, operator_id);
    } catch (e) {}
    try {
      error = await this.errorRepository.find({
        journey_id,
        operator_id,
      });
    } catch (e) {}
    try {
      carpool = await this.carpoolRepository.status({
        operator_id,
        journey_id,
        acquisition_id: acquisition._id,
      });
    } catch (e) {}

    // make tree :/
    if (!acquisition) {
      if (!error) throw new NotFoundException();
      return {
        status: `${error.error_stage}_error`,
        journey_id,
        created_at: error.created_at,
      };
    } else {
      if (carpool) {
        return {
          status: carpool,
          journey_id,
          created_at: acquisition.created_at,
        };
      } else {
        if (error) {
          return {
            status: `${error.error_stage}_error`,
            journey_id,
            created_at: error.created_at,
          };
        }
        return {
          status: 'pending',
          journey_id,
          created_at: acquisition.created_at,
        };
      }
    }
  }
}
