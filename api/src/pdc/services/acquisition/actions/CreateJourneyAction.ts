import {
  ContextType,
  handler,
  InvalidRequestException,
  ParseErrorException,
  UnprocessableRequestException,
  ValidatorInterfaceResolver,
} from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { CarpoolAcquisitionService } from "@/pdc/providers/carpool/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "../interfaces/create.contract.ts";

import { semver } from "@/deps.ts";
import { logger } from "@/lib/logger/index.ts";
import { get } from "@/lib/object/index.ts";
import { v3alias } from "../interfaces/create.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: "operator.acquisition.create",
    }),
  ],
})
export class CreateJourneyAction extends AbstractAction {
  constructor(
    private validator: ValidatorInterfaceResolver,
    private acquisitionService: CarpoolAcquisitionService,
  ) {
    super();
  }

  protected async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    const operator_id = get(context, "call.user.operator_id");

    // validate the params manually to log rejected journeys
    try {
      await this.validate(params);

      const result = await this.acquisitionService.registerRequest({
        api_version: context.call?.api_version_range || "3",
        operator_id,
        operator_journey_id: params.operator_journey_id,
        operator_trip_id: params.operator_trip_id,
        operator_class: params.operator_class as any,
        start_datetime: params.start.datetime,
        start_position: {
          lat: params.start.lat,
          lon: params.start.lon,
        },
        end_datetime: params.end.datetime,
        end_position: {
          lat: params.end.lat,
          lon: params.end.lon,
        },
        distance: params.distance,
        licence_plate: params.licence_plate,
        driver_identity_key: params.driver.identity.identity_key,
        driver_operator_user_id: params.driver.identity.operator_user_id,
        driver_phone: params.driver.identity.phone,
        driver_phone_trunc: params.driver.identity.phone_trunc,
        driver_travelpass_name: params.driver.identity.travel_pass?.name,
        driver_travelpass_user_id: params.driver.identity.travel_pass
          ?.user_id,
        driver_revenue: params.driver.revenue,
        passenger_identity_key: params.passenger.identity.identity_key,
        passenger_operator_user_id: params.passenger.identity.operator_user_id,
        passenger_phone: params.passenger.identity.phone,
        passenger_phone_trunc: params.passenger.identity.phone_trunc,
        passenger_travelpass_name: params.passenger.identity.travel_pass
          ?.name,
        passenger_travelpass_user_id: params.passenger.identity.travel_pass
          ?.user_id,
        passenger_over_18: params.passenger.identity.over_18,
        passenger_seats: params.passenger.seats,
        passenger_contribution: params.passenger.contribution,
        passenger_payments: params.passenger.payments,
        incentives: params.incentives,
      });
      if (result.terms_violation_error_labels.length) {
        if (semver.satisfies(semver.parse("3.1.0"), semver.parseRange(context.call?.api_version_range || "3.0"))) {
          throw new UnprocessableRequestException({ terms_violation_labels: result.terms_violation_error_labels });
        }
        throw new InvalidRequestException(result.terms_violation_error_labels);
      }
      return {
        operator_journey_id: params.operator_journey_id,
        created_at: result.created_at,
      };
    } catch (e) {
      logger.error(e.message, { operator_journey_id: params.operator_journey_id, operator_id });
      throw e;
    }
  }

  protected async validate(
    journey: ParamsInterface,
  ): Promise<void> {
    await this.validator.validate(journey, v3alias);
    const now = new Date();
    const start = get(journey, "start.datetime");
    const end = get(journey, "end.datetime");
    if (end > now || start > end) {
      throw new ParseErrorException("Journeys cannot happen in the future");
    }
    return;
  }
}
