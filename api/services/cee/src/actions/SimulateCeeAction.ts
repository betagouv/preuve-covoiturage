import { ContextType, handler, UnauthorizedException } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from '../shared/cee/simulateApplication.contract';

import { alias } from '../shared/cee/simulateApplication.schema';

import {
  CeeRepositoryProviderInterfaceResolver,
} from '../interfaces';

@handler({
  ...handlerConfig, 
  middlewares: [
    ['validate', alias],
  ],
})
export class SimulateCeeAction extends AbstractAction {
  constructor(
    protected ceeRepository: CeeRepositoryProviderInterfaceResolver
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    if (!!env('APP_DISABLE_CEE_IMPORT', false)) {
      return;
    }
  
    const { operator_id }: { operator_id: number } = context.call?.user;

    if(!operator_id || Number.isNaN(operator_id)) {
      throw new UnauthorizedException();
    }

    return;
  }
}
