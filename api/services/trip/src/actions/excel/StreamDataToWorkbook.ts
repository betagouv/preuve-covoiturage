import { provider } from '@ilos/common';
import { stream, TableColumnProperties, Worksheet } from 'exceljs';
import { normalize } from '../../helpers/normalizeExportDataHelper';
import { ExportTripInterface } from '../../interfaces/ExportTripInterface';
import { BuildExportAction } from '../BuildExportAction';

@provider()
export class StreamDataToWorkBook {
  constructor() {}

  private WORKSHEET_NAME = 'Données';

  async call(
    cursor: (count: number) => Promise<ExportTripInterface[]>,
    workbook: stream.xlsx.WorkbookWriter,
  ): Promise<void> {
    this.addColumnHeaders(workbook);
    const b1 = new Date();
    console.debug(`[trip:buildExcelExport] happenTripsToWorkbook: ${(new Date().getTime() - b1.getTime()) / 1000}s`);
    await this.happenTripsToWorkbook(cursor, workbook);
    const b2 = new Date();
    console.debug(`[trip:buildExcelExport] happenTripsToWorkbook: ${(new Date().getTime() - b2.getTime()) / 1000}s`);
    return await workbook.commit();
  }

  private createTableFromRows(workbook: stream.xlsx.WorkbookWriter) {
    const b1 = new Date();
    console.debug(`[trip:buildExcelExport] createTableFromRows: ${(new Date().getTime() - b1.getTime()) / 1000}s`);
    const rowArray: any[] = workbook
      .getWorksheet(this.WORKSHEET_NAME)
      .getRows(2, workbook.getWorksheet(this.WORKSHEET_NAME).rowCount)
      .map((r) => Object.values(r.values));

    workbook.getWorksheet(this.WORKSHEET_NAME).addTable({
      name: 'Données',
      ref: 'A1',
      columns: BuildExportAction.getColumns('territory').map((h) => {
        const columnProperty: TableColumnProperties = {
          filterButton: true,
          name: h,
        };
        return columnProperty;
      }),
      rows: rowArray,
    });
    const b2 = new Date();
    console.debug(`[trip:buildExcelExport] createTableFromRows: ${(new Date().getTime() - b2.getTime()) / 1000}s`);
  }

  private async happenTripsToWorkbook(
    getTrips: (count: number) => Promise<ExportTripInterface[]>,
    workbook: stream.xlsx.WorkbookWriter,
  ) {
    let results: ExportTripInterface[] = await getTrips(10);
    while (results.length !== 0) {
      this.writeToWorkbookSheet(workbook, results);
      results = await getTrips(10);
    }
  }

  private addColumnHeaders(wb: stream.xlsx.WorkbookWriter): void {
    const worksheet: Worksheet = wb.addWorksheet(this.WORKSHEET_NAME);
    worksheet.columns = BuildExportAction.getColumns('territory').map((c) => {
      return { header: c, key: c };
    });
  }

  private async writeToWorkbookSheet(wb: stream.xlsx.WorkbookWriter, trips: ExportTripInterface[]) {
    const worsheetData: Worksheet = wb.getWorksheet(this.WORKSHEET_NAME);
    trips.map((t) => worsheetData.addRow(normalize(t, 'Europe/Paris')).commit());
    worsheetData.commit();
  }
}
