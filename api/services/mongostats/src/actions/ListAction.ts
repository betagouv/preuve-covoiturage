import { Action } from '@ilos/core';
import { handler } from '@ilos/common';

import { MongostatsRepositoryProvider } from '../providers/MongoStatsRepositoryProvider';

@handler({
  service: 'mongostats',
  method: 'list',
})
export class ListAction extends Action {
  constructor(private repository: MongostatsRepositoryProvider) {
    super();
  }

  public async handle(): Promise<any[]> {
    return this.repository.list();
  }
}
