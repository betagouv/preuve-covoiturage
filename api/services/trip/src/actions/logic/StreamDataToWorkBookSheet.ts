import { FlattenTripInterface } from '../BuildExportAction'
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

    async call(campaign_id: number, wb: Workbook): Promise<Workbook> {
      const getTrips: (count: number) => Promise<ExportTripInterface[]> = await this.tripRepositoryProvider.searchWithCursorForCampaign({campaign_id})  
      let results: ExportTripInterface[] = await getTrips(10);
      while(results.length !== 0) {
        this.writeToWorkbookSheet(wb, results)
        results = await getTrips(10);
      }
      return wb
    }

    private writeToWorkbookSheet(wb: Workbook, trips: ExportTripInterface[]): void {
      const worsheetData: Worksheet = wb.getWorksheet('data');
      trips.forEach(t => {
        const normalizedTrip: FlattenTripInterface = normalize(t, 'Europe/Paris');
        worsheetData.addRow(normalizedTrip)
        // worsheetData.getTable('Données').addRow(Object.values(normalizedTrip))
      });
      // worsheetData.getTable('Données').commit();
    }
}
