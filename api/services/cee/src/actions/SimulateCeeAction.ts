import { ConfigInterfaceResolver, ContextType, handler, RPCErrorLevel, ServiceDisabledException } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/cee/simulateApplication.contract';

import { alias } from '../shared/cee/simulateApplication.schema';

import { ConflictException } from '@ilos/common';
import { getOperatorIdOrFail } from '../helpers/getOperatorIdOrFail';
import {
  ApplicationCooldownConstraint,
  CeeJourneyTypeEnum,
  CeeRepositoryProviderInterfaceResolver,
} from '../interfaces';

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
      throw new ServiceDisabledException();
    }

    const operator_id = getOperatorIdOrFail(context);

    const constraint: ApplicationCooldownConstraint = this.config.get('rules.applicationCooldownConstraint');
    const search = { ...params, datetime: new Date() };
    const data =
      params.journey_type === CeeJourneyTypeEnum.Short
        ? await this.ceeRepository.searchForShortApplication(search, constraint)
        : await this.ceeRepository.searchForLongApplication(search, constraint);
    if (!data) {
      return;
    }
    if (data.operator_id === operator_id) {
      throw new ConflictException({
        message: 'Conflict',
        level: RPCErrorLevel.WARN,
        uuid: data.uuid,
        datetime: data.datetime.toISOString(),
      });
    } else {
      throw new ConflictException({
        message: 'Conflict',
        level: RPCErrorLevel.WARN,
        datetime: data.datetime.toISOString(),
      });
    }
  }
}
