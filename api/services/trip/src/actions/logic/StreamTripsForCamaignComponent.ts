import { LoadExcelFileComponent } from './LoadExcelFileComponent'
import { Workbook } from 'exceljs'
import { ExportTripInterface } from '../../interfaces/ExportTripInterface';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import path from 'path';
import os from 'os';

export class StreamTripsForCamaignComponent {

  constructor(
    private tripRepositoryProvider: TripRepositoryProvider,
    private loadExcelFileComponent: LoadExcelFileComponent) {
    }

    /**
     * @param campaign_id 
     * @returns a reference to the written xlsx  file
     */
  async call(campaign_id: number): Promise<Workbook> {
    // Prepare excel file
    // const filename = path.join(os.tmpdir(), `covoiturage-${v4()}`) + '.csv';
    const wb: Workbook = await this.loadExcelFileComponent.call()

    // Prepare cursor for streaming
    const getTrips: (count: number) => Promise<ExportTripInterface[]> = await this.tripRepositoryProvider.searchWithCursorForCampaign({campaign_id})  
    let results = await getTrips(10);
    while(results.length !== 0) {
      for (const line of results) {
        console.info('line -> ' + line)
        // Stream result in xlsx
        // https://github.com/exceljs/exceljs/issues/91
        // https://stackoverflow.com/questions/35272928/creating-transform-stream-using-exceljs-for-writing-xlsx
      }
      results = await getTrips(10);
    }
    return null;
  }


}