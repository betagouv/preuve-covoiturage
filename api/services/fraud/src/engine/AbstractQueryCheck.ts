import { FraudCheckResult } from '../interfaces/FraudCheck';
import { AbstractCheck } from './AbstractCheck';
import { PostgresConnection } from '@ilos/connection-postgres';

export abstract class AbstractQueryCheck<P = any, R = any> extends AbstractCheck {
  public static readonly key: string;
  public carpoolView = 'common.carpools';

  abstract readonly query: string;

  constructor(
    private connection: PostgresConnection,
  ) {
    super();
  }
  
  async handle(acquisitionId: number, meta?: R): Promise<FraudCheckResult<R>> {
    const query = {
      text: `WITH data as (${this.query}) SELECT * from data WHERE acquisition_id = $1 LIMIT 1`,
      values: [acquisitionId],
    };
    const line = await this.connection.getClient().query(query);

    if (line.rowCount !== 1) {
      throw new Error();
    }

    const result = await this.cursor(line.rows[0], meta);
    return result;
  }

  abstract async cursor(params: P, meta?: R): Promise<FraudCheckResult<R>>;
}
