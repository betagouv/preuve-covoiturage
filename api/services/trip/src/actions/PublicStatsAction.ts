// tslint:disable:variable-name
import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/publicStats.contract';
import { TripPgRepositoryProvider } from '../providers/TripPgRepositoryProvider';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';

@handler(handlerConfig)
export class PublicStatsAction extends Action {
  public readonly middlewares: ActionMiddleware[] = [];

  constructor(private pg: TripPgRepositoryProvider) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    // todo: create specific interface for stats
    return (await this.pg.stats({ skip: 0, limit: 0 })) || [];
  }
}
