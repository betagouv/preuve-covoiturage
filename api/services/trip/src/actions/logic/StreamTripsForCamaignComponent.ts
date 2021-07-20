import { ExcelWorkbookHandler } from './ExcelWorkbookHandler'
import { Workbook } from 'exceljs'
import { ExportTripInterface } from '../../interfaces/ExportTripInterface';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { writeToWorkbookSheet } from './writeToWorkbookSheet';


// TODO: refactor make this return Excel file and writeToWorkbookSheet a class that return a workbook
export class StreamTripsForCamaignComponent {

  constructor(
    private tripRepositoryProvider: TripRepositoryProvider,
    private excelWorkbookHandler: ExcelWorkbookHandler) {
    }

  async getExcelFile(campaign_id: number): Promise<string> {
    const workbook: Workbook = await this.call(campaign_id);
    return await this.excelWorkbookHandler.writeWorkbookToTempFile(workbook);
  }

  async call(campaign_id: number): Promise<Workbook> {
    const workbook: Workbook = await this.excelWorkbookHandler.loadWorkbookTemplate()

    const getTrips: (count: number) => Promise<ExportTripInterface[]> = await this.tripRepositoryProvider.searchWithCursorForCampaign({campaign_id})  
    let results: ExportTripInterface[] = await getTrips(10);
    while(results.length !== 0) {
      writeToWorkbookSheet(workbook, results)
      results = await getTrips(10);
    }
    return workbook;
  }


}