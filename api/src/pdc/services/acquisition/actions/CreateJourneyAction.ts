import { _ } from '@/deps.ts';
import { Action as AbstractAction, env } from '@/ilos/core/index.ts';
import { handler, ContextType, ParseErrorException, ConflictException, ValidatorInterfaceResolver } from '@/ilos/common/index.ts';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@/pdc/providers/middleware/index.ts';
import { CarpoolAcquisitionService } from '@/pdc/providers/carpool/index.ts';

import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/acquisition/create.contract.ts';

import { PayloadV3 } from '@/shared/acquisition/create.contract.ts';
import { v3alias } from '@/shared/acquisition/create.schema.ts';
import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider.ts';
import { AcquisitionErrorStageEnum, AcquisitionStatusEnum } from '../interfaces/AcquisitionRepositoryProviderInterface.ts';

@handler({
  ...handlerConfig,
  middlewares: [...copyGroupIdAndApplyGroupPermissionMiddlewares({ operator: 'operator.acquisition.create' })],
})
export class CreateJourneyAction extends AbstractAction {
  constructor(
    private repository: AcquisitionRepositoryProvider,
    private validator: ValidatorInterfaceResolver,
    private acquisitionService: CarpoolAcquisitionService,
  ) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const request_id = _.get(context, 'call.metadata.req.headers.x-request-id');
    const operator_id = _.get(context, 'call.user.operator_id');
    const application_id = _.get(context, 'call.user.application_id');
    const { api_version: apiVersionString, ...payload } = params;
    const api_version = parseInt((apiVersionString || '').substring(1), 10);
    if (Number.isNaN(api_version)) {
      throw new ParseErrorException(`Api version should be a number ${apiVersionString}`);
    }
    const operator_journey_id = api_version === 2 ? _.get(params, 'journey_id') : _.get(params, 'operator_journey_id');

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

      if (env.or_false('APP_ENABLE_CARPOOL_V2')) {
        await this.acquisitionService.registerRequest({
          api_version,
          operator_id,
          operator_journey_id,
          operator_trip_id: payload.operator_trip_id,
          operator_class: payload.operator_class as any,
          start_datetime: payload.start.datetime,
          start_position: {
            lat: payload.start.lat,
            lon: payload.start.lon,
          },
          end_datetime: payload.end.datetime,
          end_position: {
            lat: payload.end.lat,
            lon: payload.end.lon,
          },
          distance: payload.distance,
          licence_plate: payload.licence_plate,
          driver_identity_key: payload.driver.identity.identity_key,
          driver_operator_user_id: payload.driver.identity.operator_user_id,
          driver_phone: payload.driver.identity.phone,
          driver_phone_trunc: payload.driver.identity.phone_trunc,
          driver_travelpass_name: payload.driver.identity.travel_pass?.name,
          driver_travelpass_user_id: payload.driver.identity.travel_pass?.user_id,
          driver_revenue: payload.driver.revenue,
          passenger_identity_key: payload.passenger.identity.identity_key,
          passenger_operator_user_id: payload.passenger.identity.operator_user_id,
          passenger_phone: payload.passenger.identity.phone,
          passenger_phone_trunc: payload.passenger.identity.phone_trunc,
          passenger_travelpass_name: payload.passenger.identity.travel_pass?.name,
          passenger_travelpass_user_id: payload.passenger.identity.travel_pass?.user_id,
          passenger_over_18: payload.passenger.identity.over_18,
          passenger_seats: payload.passenger.seats,
          passenger_contribution: payload.passenger.contribution,
          passenger_payments: payload.passenger.payments,
          incentives: payload.incentives,
        });
      }

      return {
        operator_journey_id: acquisitions[0].operator_journey_id,
        created_at: acquisitions[0].created_at,
      };
    } catch (e) {
      console.error(e.message, { operator_journey_id, operator_id });

      if (e instanceof ConflictException) {
        throw e;
      }

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
        const start = _.get(v3Journey, 'start.datetime');
        const end = _.get(v3Journey, 'end.datetime');
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
