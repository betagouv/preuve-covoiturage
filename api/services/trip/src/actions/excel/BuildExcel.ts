import { provider } from '@ilos/common';
import { ProgressiveDistanceRangeMetaParameters } from '~/shared/policy/common/interfaces/ProgressiveDistanceRangeMetaParameters';
import { PgCursorHandler } from '../../interfaces/PromisifiedPgCursor';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { ResultInterface as Campaign } from '~/shared/policy/find.contract';
import { SlicesInterface } from './../../interfaces/SlicesInterface';
import { BuildFilepath } from './BuildFilepath';
import { DataWorkBookWriter } from './writer/DataWorkbookWriter';
import { SlicesWorkbookWriter } from './writer/SlicesWorkbookWriter';

@provider()
export class BuildExcel {
  constructor(
    private tripRepositoryProvider: TripRepositoryProvider,
    private buildFilepath: BuildFilepath,
    private dataWorkbookWriter: DataWorkBookWriter,
    private slicesWorkbookWriter: SlicesWorkbookWriter,
  ) {}

  async call(campaign: Campaign, start_date: Date, end_date: Date, operator_id: number): Promise<string> {
    const filepath: string = this.buildFilepath.call(campaign.name, operator_id, start_date);
    await this.callSlicesWorkbookWriter(campaign, start_date, end_date, operator_id, filepath);
    await this.callDataWorkbookWriter(campaign, start_date, end_date, operator_id, filepath);
    return filepath;
  }

  private async callSlicesWorkbookWriter(
    campaign: Campaign,
    start_date: Date,
    end_date: Date,
    operator_id: number,
    filepath: string,
  ) {
    try {
      const distanceRangeRules: ProgressiveDistanceRangeMetaParameters[] = campaign.rules
        .flat()
        .filter((f) => f.slug == 'progressive_distance_range_meta')
        .map((r) => r.parameters as ProgressiveDistanceRangeMetaParameters);
      if (distanceRangeRules.length === 0) {
        return;
      }
      const slices: SlicesInterface[] = await this.getFundCallSlices(
        campaign,
        start_date,
        end_date,
        operator_id,
        distanceRangeRules,
      );
      console.info(slices);

      await this.slicesWorkbookWriter.call(filepath, slices);
    } catch (e) {
      console.error(`Error while computing slices for campaign fund call ${filepath}`, e);
    }
  }

  private async callDataWorkbookWriter(
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

    return await this.dataWorkbookWriter.call(tripCursor, filepath);
  }

  private getFundCallSlices(
    campaign: Campaign,
    start_date: Date,
    end_date: Date,
    operator_id: number,
    slices: ProgressiveDistanceRangeMetaParameters[],
  ): Promise<SlicesInterface[]> {
    return this.tripRepositoryProvider.computeFundCallsSlices(
      {
        date: {
          start: start_date,
          end: end_date,
        },
        campaign_id: [campaign._id],
        operator_id: [operator_id],
      },
      slices,
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
