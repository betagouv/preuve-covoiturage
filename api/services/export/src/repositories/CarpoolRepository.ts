import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres/dist';
import { CarpoolRow } from '../models/CarpoolRow';
import { ExportParams } from '../models/ExportParams';
import { XLSXWriter } from '../models/XLSXWriter';
import { CarpoolListQuery } from './queries/CarpoolListQuery';

export interface CarpoolRepositoryInterface {
  list(params: ExportParams, fileWriter: XLSXWriter): Promise<void>;
}

export abstract class CarpoolRepositoryInterfaceResolver implements CarpoolRepositoryInterface {
  public async list(params: ExportParams, fileWriter: XLSXWriter): Promise<void> {
    throw new Error('Not implemented');
  }
}

@provider({
  identifier: CarpoolRepositoryInterfaceResolver,
})
export class CarpoolRepository implements CarpoolRepositoryInterface {
  public readonly table = 'carpool.carpools';
  private readonly batchSize = 1000;

  constructor(public connection: PostgresConnection) {}

  public async list(params: ExportParams, fileWriter: XLSXWriter): Promise<void> {
    const { start_at, end_at } = params.get();
    const values = [start_at, end_at];

    // TODO split date range into chunks

    let cursor: any; // FIXME type PostgresConnection['getCursor'] fails

    // use a cursor to loop over the entire set of results
    // by chunks of N rows.
    try {
      let count = 0;
      const text = new CarpoolListQuery().getText();
      cursor = await this.connection.getCursor(text, values);
      do {
        const results = await cursor.read(this.batchSize);
        count = results.length;
        console.debug(`[export:CarpoolRepository] read ${count} rows`);

        // pass each line to the file writer
        for (const row of results) {
          await fileWriter.append(new CarpoolRow(row));
        }
      } while (count !== 0);
    } catch (e) {
      console.error(`[export:CarpoolRepository] ${e.message}`, { values });
      console.debug(e.stack);
    } finally {
      await cursor.release();
    }
  }
}
