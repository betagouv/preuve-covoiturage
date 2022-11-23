import { ConfigInterfaceResolver, ContextType, handler, UnauthorizedException } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/cee/simulateApplication.contract';

import { alias } from '../shared/cee/simulateApplication.schema';

import { ApplicationCooldownConstraint, CeeJourneyTypeEnum, CeeRepositoryProviderInterfaceResolver } from '../interfaces';

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
      return;
    }

    const { operator_id }: { operator_id: number } = context.call?.user;

    if (!operator_id || Number.isNaN(operator_id)) {
      throw new UnauthorizedException();
    }

    const constraint: ApplicationCooldownConstraint = this.config.get('rules.applicationCooldownConstraint');

    switch (params.journey_type) {
      case CeeJourneyTypeEnum.Short:
        await this.ceeRepository.searchForShortApplication(params, constraint);
        break;
      case CeeJourneyTypeEnum.Long:
        await this.ceeRepository.searchForLongApplication(params, constraint);
        break;
    }
    return;
  }
}
