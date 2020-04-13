import { PostgresConnection } from '@ilos/connection-postgres';

import { FraudCheckResult, DefaultMetaInterface } from '../interfaces/FraudCheck';
import { AbstractCheck } from './AbstractCheck';

export abstract class AbstractQueryCheck<
  P = any,
  R extends DefaultMetaInterface = DefaultMetaInterface
> extends AbstractCheck<R> {
  public static readonly key: string;
  public carpoolView = 'carpool.carpools'; // TODO : change target to view

  abstract readonly query: string;

  constructor(private connection: PostgresConnection) {
    super();
  }

  async handle(acquisitionId: number, initialMeta?: R | R[]): Promise<FraudCheckResult<R | R[]>> {
    const query = {
      text: `WITH data as (${this.query}) SELECT * from data WHERE acquisition_id = $1`,
      values: [acquisitionId],
    };

    const dbResult = await this.connection.getClient().query(query);

    const result: FraudCheckResult<R | R[]> = {
      karma: 0,
      meta: null,
    };

    for (const row of dbResult.rows) {
      const { karma, meta } = await this.cursor(row, initialMeta);
      result.karma += karma;

      if (result.meta === null) {
        result.meta = meta;
      } else {
        if (!Array.isArray(result.meta)) {
          result.meta = [result.meta];
        }
        result.meta.push(meta);
      }
    }

    result.karma = Math.round(result.karma / dbResult.rowCount);
    return result;
  }

  abstract async cursor(params: P, meta?: R | R[]): Promise<FraudCheckResult<R>>;
}
