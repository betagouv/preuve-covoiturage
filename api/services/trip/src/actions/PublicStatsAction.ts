// tslint:disable:variable-name
import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/publicStats.contract';
import { TripPgRepositoryProvider } from '../providers/TripPgRepositoryProvider';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/trip/publicStats.schema';

@handler(handlerConfig)
export class PublicStatsAction extends Action {
  public readonly middlewares: ActionMiddleware[] = [['validate', alias]];

  constructor(private pg: TripPgRepositoryProvider) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // todo: create specific interface for stats
    return (await this.pg.stats({ skip: 0, limit: 0 })) || [];
  }
}
