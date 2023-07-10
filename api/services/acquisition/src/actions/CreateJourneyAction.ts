import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ParseErrorException, ConflictException, ValidatorInterfaceResolver } from '@ilos/common';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/create.contract';

import { PayloadV3 } from '../shared/acquisition/create.contract';
import { v3alias } from '../shared/acquisition/create.schema';
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
    const operator_id = get(context, 'call.user.operator_id');
    const application_id = get(context, 'call.user.application_id');
    const { api_version: apiVersionString, ...payload } = params;
    const api_version = parseInt((apiVersionString || '').substring(1));
    if (Number.isNaN(api_version)) {
      throw new ParseErrorException(`Api version should be a number ${apiVersionString}`);
    }
    const operator_journey_id = api_version === 2 ? get(params, 'journey_id') : get(params, 'operator_journey_id');

    // validate the payload manually to log rejected journeys
    try {
      await this.validate(apiVersionString, payload);
      const acquisitions = await this.repository.createOrUpdateMany([
        {
          operator_id,
          operator_journey_id,
          application_id,
          api_version,
          request_id,
          payload,
        },
      ]);
      if (acquisitions.length !== 1) {
        throw new ConflictException('Journey already registered');
      }
      return {
        operator_journey_id: acquisitions[0].operator_journey_id,
        created_at: acquisitions[0].created_at,
      };
    } catch (e) {
      if (e instanceof ConflictException) {
        throw e;
      }

      console.error(e.message, { journey_id: operator_journey_id, operator_id });
      await this.repository.createOrUpdateMany([
        {
          operator_id,
          operator_journey_id,
          application_id,
          api_version,
          request_id,
          payload,
          status: AcquisitionStatusEnum.Error,
          error_stage: AcquisitionErrorStageEnum.Acquisition,
          errors: [e],
        },
      ]);

      throw e;
    }
  }

  protected async validate(apiVersionString: string, journey: PayloadV3): Promise<void> {
    switch (apiVersionString) {
      case 'v3': {
        const v3Journey = journey as PayloadV3;
        await this.validator.validate(v3Journey, v3alias);
        const now = new Date();
        const start = get(v3Journey, 'start.datetime');
        const end = get(v3Journey, 'end.datetime');
        if (end > now || start > end) {
          throw new ParseErrorException('Journeys cannot happen in the future');
        }
        return;
      }
      default:
        throw new Error(`Unknown api version ${apiVersionString}`);
    }
  }
}
