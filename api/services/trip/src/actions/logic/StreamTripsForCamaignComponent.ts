import { ExportTripInterface } from '../../interfaces/ExportTripInterface';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';

export class StreamTripsForCamaignComponent {

  constructor(
    private tripRepositoryProvider: TripRepositoryProvider) {
    }

  async call(campaign_id: number): Promise<(count: number) => Promise<ExportTripInterface[]>> {
    const getTrips: (count: number) => Promise<ExportTripInterface[]> = await this.tripRepositoryProvider.searchWithCursorForCampaign({campaign_id})  
    let count: number = 0;
    do {
      const results = await getTrips(10);
      console.info(results)
      console.info('length -> ' + results.length)
      count = results.length;
      for (const line of results) {
        console.info('line -> ' + line)
        // write in xlsx
      }
    } while (count !== 0);

    return null;
  }


}