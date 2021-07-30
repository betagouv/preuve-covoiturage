import { BuildExportAction, FlattenTripInterface } from '../BuildExportAction'
import { ExportTripInterface } from '../../interfaces/ExportTripInterface'
import { TableColumnProperties, Workbook, Worksheet } from 'exceljs';
import { normalize } from '../../helpers/normalizeExportDataHelper';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { provider } from '@ilos/common';

// TODO: fix writing to table. Issue probably from column/row length difference 
@provider()
export class StreamDataToWorkBookSheet {
  constructor(
    private tripRepositoryProvider: TripRepositoryProvider) {
    }

    async call(campaign_id: number, wb: Workbook, start_date: Date, end_date: Date): Promise<Workbook> {
      const getTripsCallback: (count: number) => Promise<ExportTripInterface[]> = await this.tripRepositoryProvider.searchWithCursor({
        date : {
          start: start_date,
          end: end_date
        },
        campaign_id: [campaign_id]
      });
      this.addColumnHeaders(wb);
      await this.happenTripsToWorkbook(getTripsCallback, wb);
      this.createTableFromRows(wb);
      return wb;
    }

  private createTableFromRows(wb: Workbook) {
    const rowArray: any[] = wb.getWorksheet('data')
      .getRows(2, wb.getWorksheet('data').rowCount)
      .map(r => Object.values(r.values));

    wb.getWorksheet('data').addTable({
      name: 'Données', ref: 'A1', style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
      }, columns: BuildExportAction.getColumns('territory').map(h => {
        let columnProperty: TableColumnProperties = {
          filterButton: true,
          name: h,
        };
        return columnProperty;
      }), rows: rowArray
    });
  }

  private async happenTripsToWorkbook(getTrips: (count: number) => Promise<ExportTripInterface[]>, wb: Workbook) {
    let results: ExportTripInterface[] = await getTrips(10);
    while (results.length !== 0) {
      this.writeToWorkbookSheet(wb, results);
      results = await getTrips(10);
    }
  }

  private addColumnHeaders(wb: Workbook) {
    wb.getWorksheet('data').columns = BuildExportAction.getColumns('territory').map(c => {
      return { header: c, key: c };
    });
  }

    private writeToWorkbookSheet(wb: Workbook, trips: ExportTripInterface[]): void {
      const worsheetData: Worksheet = wb.getWorksheet('data');
      trips.forEach(t => {
        const normalizedTrip: FlattenTripInterface = normalize(t, 'Europe/Paris');
        worsheetData.addRow(normalizedTrip);
      });
    }
}
