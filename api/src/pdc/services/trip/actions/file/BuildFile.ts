import { provider } from '@/ilos/common/index.ts';
import { Stringifier, stringify } from 'csv-stringify';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { v4 } from 'uuid';
import { getOpenDataExportName } from '../../helpers/getOpenDataExportName.ts';
import { normalizeExport, normalizeOpendata } from '../../helpers/normalizeExportDataHelper.ts';
import { ExportTripInterface } from '../../interfaces/index.ts';
import { PgCursorHandler } from '@/shared/common/PromisifiedPgCursor.ts';
import { FormatInterface, ParamsInterface } from '@/shared/trip/buildExport.contract.ts';
import { BuildExportAction } from '../BuildExportAction.ts';

@provider()
export class BuildFile {
  constructor() {}

  public async buildCsvFromCursor(
    cursor: PgCursorHandler<ExportTripInterface>,
    params: ParamsInterface,
    date: Date,
    isOpendata: boolean,
  ): Promise<string> {
    // CSV file
    const { filename, tz } = this.cast(params.type, params, date);
    const filepath = path.join(os.tmpdir(), filename);
    const fd = await fs.promises.open(filepath, 'a');

    // Transform data
    const stringifier = this.configure(fd, params.type);
    const normalizeMethod = isOpendata ? normalizeOpendata : normalizeExport;

    try {
      let count = 0;
      do {
        const results = await cursor.read(10);
        count = results.length;
        for (const line of results) {
          stringifier.write(normalizeMethod(line, tz));
        }
      } while (count !== 0);

      // Release the db, end the stream and close the file
      await cursor.release();
      stringifier.end();
      await fd.close();

      console.debug(`Finished exporting file: ${filepath}`);

      return filepath;
    } catch (e) {
      await cursor.release();
      await fd.close();
      console.error(e.message, e.stack);
      throw e;
    }
  }

  private cast(type: string, params: ParamsInterface, date: Date): Required<FormatInterface> {
    return {
      tz: params.format?.tz ?? 'Europe/Paris',
      filename:
        params.format?.filename ?? type === 'opendata' ? getOpenDataExportName('csv', date) : `covoiturage-${v4()}.csv`,
    };
  }

  private configure(fd: fs.promises.FileHandle, type = 'opendata'): Stringifier {
    const stringifier = stringify({
      delimiter: ';',
      header: true,
      columns: BuildExportAction.getColumns(type),
      cast: {
        boolean: (b: Boolean): string => (b ? 'OUI' : 'NON'),
        date: (d: Date): string => d.toISOString(),
        number: (n: Number): string => n.toString().replace('.', ','),
      },
      quoted: true,
      quoted_empty: true,
      quoted_string: true,
    });

    stringifier.on('readable', async () => {
      let row: string;
      while ((row = stringifier.read()) !== null) {
        await fd.appendFile(row, { encoding: 'utf8' });
      }
    });

    stringifier.on('end', () => {
      console.debug(`Finished exporting CSV`);
    });

    stringifier.on('error', (err) => {
      console.error(err.message);
    });

    return stringifier;
  }
}
