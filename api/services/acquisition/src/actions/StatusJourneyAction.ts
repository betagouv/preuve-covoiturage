import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, NotFoundException } from '@ilos/common';

import { alias } from '../shared/acquisition/status.schema';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/status.contract';
import {
  JourneyRepositoryProviderInterfaceResolver,
  ExistsResultInterface,
} from '../interfaces/JourneyRepositoryProviderInterface';
import { ErrorRepositoryProviderInterfaceResolver } from '../interfaces/ErrorRepositoryProviderInterface';
import { CarpoolRepositoryInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';
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
    const operator_id: number = get(context, 'call.user.operator_id', null);

    if (!operator_id) throw new NotFoundException();

    /**
     * 1. check acquisition
     * 2. check carpool if found
     * 3. check errors on failure
     */

    let acquisition: ExistsResultInterface;
    let error: AcquisitionErrorInterface;
    let carpool: string;

    // fetch all states
    try {
      acquisition = await this.acquisitionRepository.exists(journey_id, operator_id);
    } catch (e) {
      if (!(e instanceof NotFoundException)) throw e;
    }

    try {
      error = await this.errorRepository.find({
        journey_id,
        operator_id,
      });
    } catch (e) {
      if (!(e instanceof NotFoundException)) throw e;
    }

    try {
      carpool = await this.carpoolRepository.status({
        operator_id,
        journey_id,
        acquisition_id: acquisition?._id,
      });
    } catch (e) {
      if (!(e instanceof NotFoundException)) throw e;
    }

    // make tree :/
    if (!acquisition) {
      if (!error) throw new NotFoundException();
      return {
        status: `${error.error_stage}_error`,
        journey_id,
        created_at: error.created_at,
        metadata: {
          message: error.error_message,
        },
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
            metadata: {
              message: error.error_message,
            },
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
