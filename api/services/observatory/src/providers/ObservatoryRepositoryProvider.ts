import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  DataSetInterface,
  ParamsInterface as StatsParamsInterface,
  ResultInterface as StatsResultInterface,
} from '../shared/observatory/stats.contract';

export interface ObservatoryRepositoryInterface {
  stats(params: StatsParamsInterface): Promise<StatsResultInterface>;
}

export abstract class ObservatoryRepositoryInterfaceResolver implements ObservatoryRepositoryInterface {
  async stats(params: StatsParamsInterface): Promise<StatsResultInterface> {
    throw new Error('Method not implemented.');
  }
}

@provider({
  identifier: ObservatoryRepositoryInterfaceResolver,
})
export class ObservatoryRepositoryProvider implements ObservatoryRepositoryInterface {
  private readonly table = 'geo.perimeters';

  constructor(private pg: PostgresConnection) {}

  async stats(params: StatsParamsInterface): Promise<StatsResultInterface> {
    let dataset:StatsResultInterface = {
      data:[]
    };
    const response: { rowCount: number; rows: DataSetInterface[] } = await this.pg.getClient().query({
      text: `
        SELECT
          distinct l_arr
        FROM ${this.table}
        WHERE year = 2022
      `,
      values: [],
    });
    dataset.data = response.rows;
    return dataset;
  }
}
