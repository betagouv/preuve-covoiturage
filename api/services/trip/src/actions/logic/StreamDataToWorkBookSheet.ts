import { BuildExportAction, FlattenTripInterface } from '../BuildExportAction'
import { ExportTripInterface } from '../../interfaces/ExportTripInterface'
import { Workbook, Worksheet } from 'exceljs';
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
      const getTrips: (count: number) => Promise<ExportTripInterface[]> = await this.tripRepositoryProvider.searchWithCursor({
        date : {
          start: start_date,
          end: end_date
        },
        campaign_id: [campaign_id]
      });
      this.addColumnHeaders(wb);
      let results: ExportTripInterface[] = await getTrips(10);
      while(results.length !== 0) {
        this.writeToWorkbookSheet(wb, results)
        results = await getTrips(10);
      }
      return wb
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
