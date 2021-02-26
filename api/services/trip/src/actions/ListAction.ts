import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { get } from 'lodash';
import { copyGroupIdAndApplyGroupPermissionMiddlewares, validateDateMiddleware } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/list.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { alias } from '../shared/trip/list.schema';
import * as middlewareConfig from '../config/middlewares';

// TODO
@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.trip.list',
      operator: 'operator.trip.list',
      registry: 'registry.trip.list',
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
