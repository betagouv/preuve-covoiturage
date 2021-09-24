import { provider } from '@ilos/common';
import { stream, Worksheet } from 'exceljs';
import { normalize } from '../../../helpers/normalizeExportDataHelper';
import { ExportTripInterface } from '../../../interfaces/ExportTripInterface';
import { BuildExportAction } from '../../BuildExportAction';

@provider()
export class StreamDataToWorkBook {
  constructor() {}

  public readonly WORKSHEET_NAME = 'Données';

  async call(cursor: (count: number) => Promise<ExportTripInterface[]>, filepath: string): Promise<void> {
    const workbookWriter: stream.xlsx.WorkbookWriter = new stream.xlsx.WorkbookWriter({
      filename: filepath,
    });
    this.writeColumnHeaders(workbookWriter);
    const b1 = new Date();
    console.debug(`[trip:buildExcelExport] writeTrips: ${(new Date().getTime() - b1.getTime()) / 1000}s`);
    let results: ExportTripInterface[] = await cursor(10);
    while (results.length !== 0) {
      this.writeTrips(workbookWriter, results);
      results = await cursor(10);
    }
    const b2 = new Date();
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
    trips.map((t) => worsheetData.addRow(normalize(t, 'Europe/Paris')).commit());
  }
}
