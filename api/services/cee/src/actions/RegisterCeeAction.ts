import { ConfigInterfaceResolver, ContextType, handler } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/cee/registerApplication.contract';

import { alias } from '../shared/cee/registerApplication.schema';

import {
  ApplicationCooldownConstraint,
  CeeJourneyTypeEnum,
  CeeRepositoryProviderInterfaceResolver,
  TimeRangeConstraint,
  ValidJourneyConstraint,
} from '../interfaces';
import { ServiceDisabledError } from '../errors/ServiceDisabledError';
import { getOperatorIdOrFail } from '../helpers/getOperatorIdOrFail';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias]],
})
export class RegisterCeeAction extends AbstractAction {
  constructor(
    protected ceeRepository: CeeRepositoryProviderInterfaceResolver,
    protected config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    if (!!env('APP_DISABLE_CEE_REGISTER', false)) {
      throw new ServiceDisabledError();
    }

    const operator_id = getOperatorIdOrFail(context);

    const timeConstraint: TimeRangeConstraint = this.config.get('rules.timeRangeConstraint');
    const cooldownConstraint: ApplicationCooldownConstraint = this.config.get('rules.applicationCooldownConstraint');
    const validJourneyConstraint: ValidJourneyConstraint = this.config.get('rules.validJourneyConstraint');

    try {
      switch (params.journey_type) {
        case CeeJourneyTypeEnum.Short:
          const carpoolData = await this.ceeRepository.searchForValidJourney(
            { operator_id, operator_journey_id: params.operator_journey_id },
            validJourneyConstraint,
          );
          if (!timeConstraint.short(carpoolData.datetime)) {
            throw new Error();
          }
          return {
            uuid: await this.ceeRepository.registerShortApplication(
              { ...params, ...carpoolData, operator_id },
              cooldownConstraint,
            ),
            datetime: carpoolData.datetime.toISOString(),
            token: await this.sign(operator_id, params.journey_type, params.driving_license, carpoolData.datetime),
            journey_id: carpoolData.acquisition_id,
            status: carpoolData.status,
          };
        case CeeJourneyTypeEnum.Long:
          if (!timeConstraint.long(params.datetime)) {
            throw new Error();
          }
          return {
            uuid: await this.ceeRepository.registerLongApplication({ ...params, operator_id }, cooldownConstraint),
            datetime: carpoolData.datetime.toISOString(),
            token: await this.sign(operator_id, params.journey_type, params.driving_license, carpoolData.datetime),
          };
      }
    } catch (e) {}
  }

  public async sign(
    operator_id: number,
    journey_type: CeeJourneyTypeEnum,
    license: string,
    datetime: Date,
  ): Promise<string> {
    return 'TODO';
  }
}
