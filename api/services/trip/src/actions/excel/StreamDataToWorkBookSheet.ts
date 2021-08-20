import { BuildExportAction, FlattenTripInterface } from '../BuildExportAction';
import { ExportTripInterface } from '../../interfaces/ExportTripInterface';
import { TableColumnProperties, Workbook, Worksheet } from 'exceljs';
import { normalize } from '../../helpers/normalizeExportDataHelper';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { provider } from '@ilos/common';

@provider()
export class StreamDataToWorkBookSheet {
  constructor(private tripRepositoryProvider: TripRepositoryProvider) {}

  async call(campaign_id: number, workbook: Workbook, start_date: Date, end_date: Date): Promise<Workbook> {
    const getTripsCallback: (
      count: number,
    ) => Promise<ExportTripInterface[]> = await this.tripRepositoryProvider.searchWithCursor(
      {
        date: {
          start: start_date,
          end: end_date,
        },
        campaign_id: [campaign_id],
      },
      'territory',
    );
    this.addColumnHeaders(workbook);
    const emptyRowsCount: number = workbook.getWorksheet('data').lastRow.number;
    const b1 = new Date();
    await this.happenTripsToWorkbook(getTripsCallback, workbook);
    console.debug(`[trip:buildExcelExport] happenTripsToWorkbook: ${(new Date().getTime() - b1.getTime()) / 1000}s`);
    // Discard empty rows from worksheet, should not be there in the first place ...
    workbook.getWorksheet('data').spliceRows(1, emptyRowsCount - 1);
    const b2 = new Date();
    this.createTableFromRows(workbook);
    console.debug(`[trip:buildExcelExport] createTableFromRows: ${(new Date().getTime() - b2.getTime()) / 1000}s`);
    return workbook;
  }

  private createTableFromRows(workbook: Workbook) {
    const rowArray: any[] = workbook
      .getWorksheet('data')
      .getRows(2, workbook.getWorksheet('data').rowCount)
      .map((r) => Object.values(r.values));

    workbook.getWorksheet('data').addTable({
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
  }

  private async happenTripsToWorkbook(getTrips: (count: number) => Promise<ExportTripInterface[]>, workbook: Workbook) {
    let results: ExportTripInterface[] = await getTrips(10);
    while (results.length !== 0) {
      this.writeToWorkbookSheet(workbook, results);
      results = await getTrips(10);
    }
  }

  private addColumnHeaders(wb: Workbook) {
    wb.getWorksheet('data').columns = BuildExportAction.getColumns('territory').map((c) => {
      return { header: c, key: c };
    });
  }

  private writeToWorkbookSheet(wb: Workbook, trips: ExportTripInterface[]): void {
    const worsheetData: Worksheet = wb.getWorksheet('data');
    trips.forEach((t) => {
      const normalizedTrip: FlattenTripInterface = normalize(t, 'Europe/Paris');
      worsheetData.addRow(normalizedTrip);
    });
  }
}
