import { provider } from '@ilos/common';
import { APDFNameProvider } from '@pdc/provider-file';
import { stream } from 'exceljs';
import { CampaignSearchParamsInterface } from '~/interfaces';
import { SliceStatInterface } from '~/interfaces/PolicySliceStatInterface';
import { ResultInterface as Campaign } from '~/shared/policy/find.contract';
import { PgCursorHandler } from '../../interfaces/PromisifiedPgCursor';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { DataWorkBookWriter } from './writer/DataWorkbookWriter';
import { SlicesWorkbookWriter } from './writer/SlicesWorkbookWriter';

@provider()
export class BuildExcel {
  constructor(
    private tripRepoProvider: TripRepositoryProvider,
    private dataWorkbookWriter: DataWorkBookWriter,
    private slicesWorkbookWriter: SlicesWorkbookWriter,
    private apdfNameProvider: APDFNameProvider,
  ) {}

  public static initWorkbookWriter(filepath: string): stream.xlsx.WorkbookWriter {
    return new stream.xlsx.WorkbookWriter({ filename: filepath });
  }

  async call(
    campaign: Campaign,
    start_date: Date,
    end_date: Date,
    operator_id: number,
  ): Promise<{ filename: string; filepath: string }> {
    const params = { start_date, end_date, operator_id, campaign_id: campaign._id };

    // fetch aggregated and slice data
    const {
      count: trips,
      sum: amount,
      slices,
    } = await this.tripRepoProvider.getPolicyStats(params, campaign.params.slices || []);

    // generate the filename and filepath
    const fileParams = {
      name: campaign.name,
      campaign_id: campaign._id,
      operator_id,
      datetime: start_date,
      trips,
      amount,
    };
    const filename: string = this.apdfNameProvider.filename(fileParams);
    const filepath: string = this.apdfNameProvider.filepath(filename);

    // create the Worksheet
    const workbookWriter: stream.xlsx.WorkbookWriter = BuildExcel.initWorkbookWriter(filepath);
    await this.writeTrips(workbookWriter, params);
    await this.writeSlices(workbookWriter, slices);
    await workbookWriter.commit();

    return { filename, filepath };
  }

  private async writeTrips(wkw: stream.xlsx.WorkbookWriter, params: CampaignSearchParamsInterface): Promise<void> {
    try {
      const tripCursor: PgCursorHandler = await this.getTripsCursor(params);
      await this.dataWorkbookWriter.call(tripCursor, wkw);
    } catch (e) {
      console.error('Error while writing trips');
    }
  }

  private async writeSlices(wkw: stream.xlsx.WorkbookWriter, slices: SliceStatInterface[]): Promise<void> {
    try {
      if (!slices.length) return;
      await this.slicesWorkbookWriter.call(wkw, slices);
    } catch (e) {
      console.error('Error while computing slices');
    }
  }

  private getTripsCursor(params: CampaignSearchParamsInterface): Promise<PgCursorHandler> {
    return this.tripRepoProvider.searchWithCursor(
      {
        date: {
          start: params.start_date,
          end: params.end_date,
        },
        campaign_id: [params.campaign_id],
        operator_id: [params.operator_id],
      },
      'territory',
    );
  }
}
