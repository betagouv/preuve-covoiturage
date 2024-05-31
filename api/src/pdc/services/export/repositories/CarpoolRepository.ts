import { provider } from '@ilos/common/index.ts';
import { PostgresConnection } from '@ilos/connection-postgres/index.ts';
import { CarpoolRow } from '../models/CarpoolRow.ts';
import { ExportParams } from '../models/ExportParams.ts';
import { XLSXWriter } from '../models/XLSXWriter.ts';
import { ExportProgress } from './ExportRepository.ts';
import { CarpoolListQuery, TemplateKeys } from './queries/CarpoolListQuery.ts';
import { QueryTemplates } from './queries/Query.ts';

export interface CarpoolRepositoryInterface {
  list(params: ExportParams, fileWriter: XLSXWriter): Promise<void>;
  count(params: ExportParams): Promise<number>;
}

export abstract class CarpoolRepositoryInterfaceResolver implements CarpoolRepositoryInterface {
  public async list(params: ExportParams, fileWriter: XLSXWriter): Promise<void> {
    throw new Error('Not implemented');
  }
  public async count(params: ExportParams): Promise<number> {
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

  public async list(params: ExportParams, fileWriter: XLSXWriter, progress?: ExportProgress): Promise<void> {
    const [values, templates] = this.getListValuesAndTemplates(params);

    // use a cursor to loop over the entire set of results
    // by chunks of N rows.
    let cursor: any; // FIXME type PostgresConnection['getCursor'] fails

    try {
      const total = await this.count(params); // total number of rows
      let done = 0; // track the number of rows read
      let count = 0; // number of rows read in the current batch

      const text = new CarpoolListQuery().getText(templates);
      cursor = await this.connection.getCursor(text, values);
      do {
        const results = await cursor.read(this.batchSize);
        count = results.length;
        done += count;

        // pass each line to the file writer
        for (const row of results) {
          await fileWriter.append(new CarpoolRow(row));
        }

        if (progress) await progress(((done / total) * 100) | 0);
      } while (count !== 0);
    } catch (e) {
      console.error(`[export:CarpoolRepository] ${e.message}`, { values });
      console.debug(e.stack);
    } finally {
      await cursor.release();
    }
  }

  public async count(params: ExportParams): Promise<number> {
    const [values, templates] = this.getListValuesAndTemplates(params);
    const { rows } = await this.connection.getClient().query<any>({
      text: new CarpoolListQuery().getCountText(templates),
      values,
    });

    return parseInt(rows[0].count, 10);
  }

  private getListValuesAndTemplates(params: ExportParams): [[Date, Date, number], QueryTemplates<TemplateKeys>] {
    const { start_at, end_at } = params.get();
    const values: [Date, Date, number] = [start_at, end_at, 2023];
    const templates: QueryTemplates<TemplateKeys> = new Map();
    templates.set('geo_selectors', params.geoToSQL());
    templates.set('operator_id', params.operatorToSQL());

    return [values, templates];
  }
}
