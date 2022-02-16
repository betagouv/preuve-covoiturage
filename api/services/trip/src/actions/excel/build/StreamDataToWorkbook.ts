import { provider } from '@ilos/common';
import { stream, Worksheet } from 'exceljs';
import { normalizeExport } from '../../../helpers/normalizeExportDataHelper';
import { ExportTripInterface } from '../../../interfaces/ExportTripInterface';
import { PgCursorHandler } from '../../../interfaces/PromisifiedPgCursor';
import { BuildExportAction } from '../../BuildExportAction';

@provider()
export class StreamDataToWorkBook {
  constructor() {}

  public readonly WORKSHEET_NAME = 'Données';

  async call(cursor: PgCursorHandler, filepath: string): Promise<void> {
    const workbookWriter: stream.xlsx.WorkbookWriter = new stream.xlsx.WorkbookWriter({
      filename: filepath,
    });
    this.writeColumnHeaders(workbookWriter);
    const b1 = new Date();
    console.debug(`[trip:buildExcelExport] writeTrips: ${(new Date().getTime() - b1.getTime()) / 1000}s`);
    let results: ExportTripInterface[] = await cursor.read(10);
    while (results.length !== 0) {
      this.writeTrips(workbookWriter, results);
      results = await cursor.read(10);
    }
    const b2 = new Date();
    cursor.release();
    console.debug(`[trip:buildExcelExport] writeTrips: ${(new Date().getTime() - b2.getTime()) / 1000}s`);
    return await workbookWriter.commit();
  }

  private writeColumnHeaders(wb: stream.xlsx.WorkbookWriter): void {
    const worksheet: Worksheet = wb.addWorksheet(this.WORKSHEET_NAME);
    worksheet.columns = BuildExportAction.getColumns('territory').map((c) => {
      return { header: c, key: c };
    });
  }

  private async writeTrips(wb: stream.xlsx.WorkbookWriter, trips: ExportTripInterface[]) {
    const worsheetData: Worksheet = wb.getWorksheet(this.WORKSHEET_NAME);
    trips.map((t) => worsheetData.addRow(normalizeExport(t, 'Europe/Paris')).commit());
  }
}
