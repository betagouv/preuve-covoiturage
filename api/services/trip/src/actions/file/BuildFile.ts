import { provider } from '@ilos/common';
import path from 'path';
import { v4 } from 'uuid';
import csvStringify, { Stringifier } from 'csv-stringify';
import { normalizeExport, normalizeOpendata } from '../../helpers/normalizeExportDataHelper';
import fs from 'fs';
import os from 'os';
import { getOpenDataExportName } from '../../helpers/getOpenDataExportName';
import { PgCursorHandler } from '../../shared/common/PromisifiedPgCursor';
import { FormatInterface, ParamsInterface } from '../../shared/trip/buildExport.contract';
import { BuildExportAction } from '../BuildExportAction';
import { ExportTripInterface } from '~/interfaces';

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
    const { filename, tz } = this.castFormat(params.type, params, date);
    const filepath = path.join(os.tmpdir(), filename);
    const fd = await fs.promises.open(filepath, 'a');

    // Write to file
    const stringifier = this.getStringifier(fd, params.type);
    const normalizeMethod = isOpendata ? normalizeOpendata : normalizeExport;
    let count = 0;
    do {
      const results = await cursor.read(10);
      count = results.length;
      for (const line of results) {
        stringifier.write(normalizeMethod(line, tz));
      }
    } while (count !== 0);

    // Release
    cursor.release();
    stringifier.end();
    await fd.close();
    console.debug(`Finished export ${filepath}`);
    return filepath;
  }

  private castFormat(type: string, params: ParamsInterface, date: Date): Required<FormatInterface> {
    return {
      tz: params.format?.tz ?? 'Europe/Paris',
      filename:
        params.format?.filename ?? type === 'opendata' ? getOpenDataExportName('csv', date) : `covoiturage-${v4()}.csv`,
    };
  }

  private getStringifier(fd: fs.promises.FileHandle, type = 'opendata'): Stringifier {
    const stringifier = csvStringify({
      delimiter: ';',
      header: true,
      columns: BuildExportAction.getColumns(type),
      cast: {
        boolean: (b: Boolean): string => (b ? 'OUI' : 'NON'),
        date: (d: Date): string => d.toISOString(),
        number: (n: Number): string => n.toString().replace('.', ','),
      },
    });

    stringifier.on('readable', async () => {
      let row;
      while (null !== (row = stringifier.read())) {
        await fd.appendFile(row, { encoding: 'utf8' });
      }
    });

    stringifier.on('error', (err) => {
      console.error(err.message);
    });

    return stringifier;
  }
}
