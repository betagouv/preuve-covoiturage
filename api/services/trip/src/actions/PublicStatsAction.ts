import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { TripSearchInterface } from '@pdc/provider-schema';

import { TripPgRepositoryProvider } from '../providers/TripPgRepositoryProvider';

/*
 * Public stats for trips
 */
@handler({
  service: 'trip',
  method: 'publicStats',
})
export class PublicStatsAction extends Action {
  constructor(private pg: TripPgRepositoryProvider) {
    super();
  }

  public async handle(params: TripSearchInterface, context: ContextType): Promise<any> {
    // todo: create specific interface for stats
    return (await this.pg.stats({ skip: 0, limit: 0 })) || [];
  }
}
