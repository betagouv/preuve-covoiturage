import { ConfigInterfaceResolver, ContextType, handler, UnauthorizedException } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/cee/simulateApplication.contract';

import { alias } from '../shared/cee/simulateApplication.schema';

import {
  ApplicationCooldownConstraint,
  CeeJourneyTypeEnum,
  CeeRepositoryProviderInterfaceResolver,
} from '../interfaces';
import { ServiceDisabledError } from '../errors/ServiceDisabledError';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias]],
})
export class SimulateCeeAction extends AbstractAction {
  constructor(
    protected ceeRepository: CeeRepositoryProviderInterfaceResolver,
    protected config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    if (!!env('APP_DISABLE_CEE_IMPORT', false)) {
      throw new ServiceDisabledError();
    }

    const { operator_id }: { operator_id: number } = context.call?.user;

    if (!operator_id || Number.isNaN(operator_id)) {
      throw new UnauthorizedException();
    }

    const constraint: ApplicationCooldownConstraint = this.config.get('rules.applicationCooldownConstraint');
    const data =
      params.journey_type === CeeJourneyTypeEnum.Short
        ? await this.ceeRepository.searchForShortApplication(params, constraint)
        : await this.ceeRepository.searchForLongApplication(params, constraint);
    if (!data) {
      return;
    }
    // TODO : error handling
    if (data.operator_id === operator_id) {
      return {
        uuid: data._id,
        datetime: data.datetime.toISOString(),
      };
    } else {
      return {
        datetime: data.datetime.toISOString(),
      };
    }
  }
}
