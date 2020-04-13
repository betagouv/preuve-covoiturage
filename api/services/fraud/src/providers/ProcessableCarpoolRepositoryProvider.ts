import { provider } from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';
import { promisify } from 'util';

import { ProcessableCarpool } from '../interfaces/ProcessableCarpool';
import {
  ProcessableCarpoolRepositoryProviderInterface,
  ProcessableCarpoolRepositoryProviderInterfaceResolver,
} from '../interfaces/ProcessableCarpoolRepositoryProviderInterface';

/*
 * Processable carpool repository
 */
@provider({
  identifier: ProcessableCarpoolRepositoryProviderInterfaceResolver,
})
export class ProcessableCarpoolRepositoryProvider implements ProcessableCarpoolRepositoryProviderInterface {
  public readonly table = 'fraudcheck.processable_carpool';

  constructor(public connection: PostgresConnection) {}

  /*
   * Refresh view
   */
  public async refresh(): Promise<void> {
    await this.connection.getClient().query({
      text: 'REFRESH MATERIALIZED VIEW fraudcheck.processable_carpool',
    });
  }

  /*
   * Get a cursor for processable acquistion
   */
  async *findProcessable(batchSize = 100): AsyncGenerator<ProcessableCarpool[], void, void> {
    const query = {
      text: `
      SELECT
        acquisition_id,
        methods as processed_methods
      FROM ${this.table}
      `,
      values: [],
    };

    const client = await this.connection.getClient().connect();
    const cursor = client.query(new Cursor(query.text, query.values));
    const promisifiedCursorRead = promisify(cursor.read.bind(cursor));

    let count = 0;
    do {
      try {
        const rows = await promisifiedCursorRead(batchSize);
        count = rows.length;
        if (count > 0) {
          yield rows;
        }
      } catch (e) {
        cursor.close(() => client.release());
        throw e;
      }
    } while (count > 0);
    cursor.close(() => client.release());
  }
}
