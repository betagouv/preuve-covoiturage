import { SlicesInterface } from './../../interfaces/SlicesInterface';
import { provider } from '@ilos/common';
import { PgCursorHandler } from '../../interfaces/PromisifiedPgCursor';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { BuildFilepath } from './build/BuildFilepath';
import { StreamDataToWorkBook } from './build/StreamDataToWorkbook';
import { ResultInterface as Campaign } from '../../shared/policy/find.contract';
import { CreateSlicesSheetToWorkbook } from './build/CreateSlicesSheetToWorkbook';

@provider()
export class BuildExcel {
  constructor(
    private tripRepositoryProvider: TripRepositoryProvider,
    private buildFilepath: BuildFilepath,
    private streamDataToWorkbook: StreamDataToWorkBook,
    private createSlicesSheetToWorkbook: CreateSlicesSheetToWorkbook,
  ) {}

  async call(campaign: Campaign, start_date: Date, end_date: Date, operator_id: number): Promise<string> {
    const filepath: string = this.buildFilepath.call(campaign.name, operator_id, start_date);
    await this.callDataToWorkbook(campaign, start_date, end_date, operator_id, filepath);
    await this.callSlicesToWorkbook(campaign, start_date, end_date, operator_id, filepath);
    return filepath;
  }

  private async callSlicesToWorkbook(
    campaign: Campaign,
    start_date: Date,
    end_date: Date,
    operator_id: number,
    filepath: string,
  ) {
    try {
      const slices: SlicesInterface[] = await this.getFundCallSlices(campaign._id, start_date, end_date, operator_id);
      await this.createSlicesSheetToWorkbook.call(filepath, slices);
    } catch (e) {
      console.error(`Error while computing slices for campaign fund call ${filepath}`, e);
    }
  }

  private async callDataToWorkbook(
    campaign: Campaign,
    start_date: Date,
    end_date: Date,
    operator_id: number,
    filepath: string,
  ) {
    const tripCursor: PgCursorHandler = await this.getTripRepositoryCursor(
      campaign._id,
      start_date,
      end_date,
      operator_id,
    );

    await this.streamDataToWorkbook.call(tripCursor, filepath, campaign);
  }

  private getFundCallSlices(
    campaign_id: number,
    start_date: Date,
    end_date: Date,
    operator_id: number,
  ): Promise<SlicesInterface[]> {
    return this.tripRepositoryProvider.computeFundCallsSlices(
      {
        date: {
          start: start_date,
          end: end_date,
        },
        campaign_id: [campaign_id],
        operator_id: [operator_id],
      },
      // TODO: fetch this from campaign
      [
        { min: 0, max: 2000 },
        { min: 2000, max: 15000 },
      ],
    );
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
