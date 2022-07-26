import { provider } from '@ilos/common';
import { Column, stream, Worksheet } from 'exceljs';
import { normalizeExport } from '../../../helpers/normalizeExportDataHelper';
import { ExportTripInterface } from '../../../interfaces/ExportTripInterface';
import { PgCursorHandler } from '../../../interfaces/PromisifiedPgCursor';
import { BuildExportAction } from '../../BuildExportAction';
import { AbstractWorkBookWriter } from './AbstractWorkbookWriter';

@provider()
export class DataWorkBookWriter extends AbstractWorkBookWriter {
  public readonly DATA_WORKSHEET_NAME = 'Données';
  public readonly DATA_WORKSHEET_COLUMN_HEADERS: Partial<Column>[] = BuildExportAction.getColumns('territory').map(
    (c) => {
      return { header: c, key: c };
    },
  );

  async call(cursor: PgCursorHandler, workbookWriter): Promise<void> {
    const worksheet: Worksheet = this.initWorkSheet(
      workbookWriter,
      this.DATA_WORKSHEET_NAME,
      this.DATA_WORKSHEET_COLUMN_HEADERS,
    );

    const b1 = new Date();
    let results: ExportTripInterface[] = await cursor.read(10);
    while (results.length !== 0) {
      results.map((t) => worksheet.addRow(normalizeExport(t, 'Europe/Paris')).commit());
      results = await cursor.read(10);
    }
    const b2 = new Date();
    cursor.release();
    console.debug(`[trip:buildExcelExport] writing trips took: ${(b2.getTime() - b1.getTime()) / 1000}s`);

    worksheet.commit();
    return;
  }
}
