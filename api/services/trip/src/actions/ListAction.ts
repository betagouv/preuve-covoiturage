import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { get } from 'lodash';
import { copyGroupIdFromContextMiddlewares, validateDateMiddleware } from '@pdc/provider-middleware';

import { alias } from '../shared/trip/list.schema';
import * as middlewareConfig from '../config/middlewares';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/list.contract';
import { groupPermissionMiddlewaresHelper } from '../middleware/groupPermissionMiddlewaresHelper';

// TODO
@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdFromContextMiddlewares(['territory_id', 'operator_id'], null, true),
    ...groupPermissionMiddlewaresHelper({
      territory: 'territory.trip.stats',
      operator: 'operator.trip.stats',
      registry: 'registry.trip.stats',
    }),
    ['validate', alias],
    validateDateMiddleware({
      startPath: 'date.start',
      endPath: 'date.end',
      minStart: () => new Date(new Date().getTime() - middlewareConfig.date.minStartDefault),
      maxEnd: () => new Date(),
      applyDefault: true,
    }),
  ],
})
export class ListAction extends Action {
  constructor(private pg: TripRepositoryProvider) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const result = await this.pg.search(params);

    // get visible operators from user context
    // unauthorized operators are replaced by null
    const authorizedOperators = get(context, 'call.user.authorizedOperators', null) || null;
    const data = result.data.map((r) => ({
      ...r,
      operator_id:
        authorizedOperators === null
          ? r.operator_id
          : authorizedOperators.indexOf(r.operator_id) === -1
          ? null
          : r.operator_id,
    }));

    return {
      ...result,
      data,
    };
  }
}
