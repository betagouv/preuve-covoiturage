import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { alias } from '@shared/observatory/keyfigures/monthlyKeyfigures.schema';
import {
  handlerConfig,
  ResultInterface,
  ParamsInterface,
} from '@shared/observatory/keyfigures/monthlyKeyfigures.contract';
import { KeyfiguresRepositoryInterfaceResolver } from '../../interfaces/KeyfiguresRepositoryProviderInterface';
import { limitNumberParamWithinRange } from '../../helpers/checkParams';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class MonthlyKeyfiguresAction extends AbstractAction {
  constructor(private repository: KeyfiguresRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(params.year, 2020, new Date().getFullYear());
    return this.repository.getMonthlyKeyfigures(params);
  }
}
