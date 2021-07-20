import { ExcelWorkbookHandler } from './ExcelWorkbookHandler'
import { Workbook } from 'exceljs'
import { ExportTripInterface } from '../../interfaces/ExportTripInterface';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { writeToExcelSheet } from './writeToExcelSheet';

export class StreamTripsForCamaignComponent {

  constructor(
    private tripRepositoryProvider: TripRepositoryProvider,
    private excelWorkbookHandler: ExcelWorkbookHandler) {
    }

  /**
   * @param campaign_id 
   * @returns a reference to the written xlsx  file
   */
  async call(campaign_id: number): Promise<Workbook> {
    const workbook: Workbook = await this.excelWorkbookHandler.loadWorkbookTemplate()

    const getTrips: (count: number) => Promise<ExportTripInterface[]> = await this.tripRepositoryProvider.searchWithCursorForCampaign({campaign_id})  
    let results: ExportTripInterface[] = await getTrips(10);
    while(results.length !== 0) {
      writeToExcelSheet(workbook, results)
      results = await getTrips(10);
    }
    return workbook;
  }


}