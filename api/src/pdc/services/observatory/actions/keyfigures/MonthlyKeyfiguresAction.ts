import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { handler } from '@/ilos/common/index.ts';
import { hasPermissionMiddleware } from '@/pdc/providers/middleware/index.ts';

import { alias } from '@/shared/observatory/keyfigures/monthlyKeyfigures.schema.ts';
import {
  handlerConfig,
  ResultInterface,
  ParamsInterface,
} from '@/shared/observatory/keyfigures/monthlyKeyfigures.contract.ts';
import { KeyfiguresRepositoryInterfaceResolver } from '../../interfaces/KeyfiguresRepositoryProviderInterface.ts';
import { limitNumberParamWithinRange } from '../../helpers/checkParams.ts';

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
