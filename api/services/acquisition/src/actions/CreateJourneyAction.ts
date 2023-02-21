import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import {
  handler,
  ContextType,
  ParseErrorException,
  ConflictException,
  ValidatorInterfaceResolver,
  InvalidParamsException,
} from '@ilos/common';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/create.contract';
import { alias } from '../shared/acquisition/create.schema';
import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider';
import { AcquisitionErrorStageEnum, AcquisitionStatusEnum } from '../interfaces/AcquisitionRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [...copyGroupIdAndApplyGroupPermissionMiddlewares({ operator: 'operator.acquisition.create' })],
})
export class CreateJourneyAction extends AbstractAction {
  constructor(private repository: AcquisitionRepositoryProvider, private validator: ValidatorInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const request_id = get(context, 'call.metadata.req.headers.x-request-id');
    const operator_journey_id = get(params, 'journey_id');
    const operator_id = get(context, 'call.user.operator_id');
    const application_id = get(context, 'call.user.application_id');
    const api_version = 2;

    // validate the payload manually to log rejected journeys
    try {
      await this.validate(params);
      const acquisitions = await this.repository.createOrUpdateMany([
        {
          operator_id,
          operator_journey_id,
          application_id,
          api_version,
          request_id,
          payload: params,
        },
      ]);
      if (acquisitions.length !== 1) {
        throw new ConflictException('Journey already registered');
      }
      return {
        journey_id: acquisitions[0].operator_journey_id,
        created_at: acquisitions[0].created_at,
      };
    } catch (e) {
      if (e instanceof ConflictException) {
        throw e;
      }

      console.error(e.message, { journey_id: params.journey_id, operator_id: params.operator_id });
      await this.repository.createOrUpdateMany([
        {
          operator_id,
          operator_journey_id,
          application_id,
          api_version,
          request_id,
          payload: params,
          status: AcquisitionStatusEnum.Error,
          error_stage: AcquisitionErrorStageEnum.Acquisition,
          errors: [e],
        },
      ]);

      throw e;
    }
  }

  protected async validate(journey: ParamsInterface): Promise<void> {
    await this.validator.validate(journey, alias);
    // reject if happening in the future
    const now = new Date();
    const start_passenger = get(journey, 'passenger.start.datetime');
    const start_driver = get(journey, 'driver.start.datetime');
    const end_passenger = get(journey, 'passenger.end.datetime');
    const end_driver = get(journey, 'driver.end.datetime');
    if (end_passenger > now || end_driver > now || start_driver > end_driver || start_passenger > end_passenger) {
      throw new ParseErrorException('Journeys cannot happen in the future');
    }
  }
}
