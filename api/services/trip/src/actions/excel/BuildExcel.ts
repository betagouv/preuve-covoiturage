import { provider } from '@ilos/common';
import { PgCursorHandler } from '../../interfaces/PromisifiedPgCursor';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { BuildFilepath } from './build/BuildFilepath';
import { StreamDataToWorkBook } from './build/StreamDataToWorkbook';
import { ResultInterface as Campaign } from '../../shared/policy/find.contract';

@provider()
export class BuildExcel {
  constructor(
    private tripRepositoryProvider: TripRepositoryProvider,
    private buildFilepath: BuildFilepath,
    private streamDataToWorkbook: StreamDataToWorkBook,
  ) {}

  async call(campaign: Campaign, start_date: Date, end_date: Date, operator_id: number): Promise<string> {
    const tripCursor: PgCursorHandler = await this.getTripRepositoryCursor(
      campaign._id,
      start_date,
      end_date,
      operator_id,
    );

    const filepath: string = this.buildFilepath.call(campaign.name, operator_id, start_date);

    return this.streamDataToWorkbook.call(tripCursor, filepath, campaign).then(() => filepath);
  }

  private getTripRepositoryCursor(
    campaign_id: number,
    start_date: Date,
    end_date: Date,
    operator_id: number,
  ): Promise<PgCursorHandler> {
    return this.tripRepositoryProvider.searchWithCursor(
      {
        date: {
          start: start_date,
          end: end_date,
        },
        campaign_id: [campaign_id],
        operator_id: [operator_id],
      },
      'territory',
    );
  }
}
