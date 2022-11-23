import { ContextType, handler, UnauthorizedException } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from '../../shared/policy/cee/registerApplication.contract';

import { alias } from '../../shared/policy/cee/registerApplication.schema';

import {
  CeeJourneyTypeEnum,
  CeeRepositoryProviderInterfaceResolver,
} from '../../interfaces';

@handler({
  ...handlerConfig, 
  middlewares: [
    ['validate', alias],
  ],
})
export class RegisterCeeAction extends AbstractAction {
  constructor(
    protected ceeRepository: CeeRepositoryProviderInterfaceResolver
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    if (!!env('APP_DISABLE_CEE_REGISTER', false)) {
      return;
    }

    // TODO
    // Check J+7
  
    const { operator_id }: { operator_id: number } = context.call?.user;

    if(!operator_id || Number.isNaN(operator_id)) {
      throw new UnauthorizedException();
    }

    try {
      switch(params.journey_type) {
        case CeeJourneyTypeEnum.Short:
            const carpoolData = { carpool_id: 0, phone_trunc: '', datetime: new Date };
            await this.ceeRepository.registerShortApplication({ ...params, ...carpoolData, operator_id });
          break;
        case CeeJourneyTypeEnum.Long:
            await this.ceeRepository.registerLongApplication({ ...params, operator_id });
          break;
      }
    } catch (e) {

    }
  }

  public sign() {

  }
}
