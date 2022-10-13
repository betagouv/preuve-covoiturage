import { provider } from '@ilos/common';
import { APDFNameProvider } from '@pdc/provider-file';
import { stream } from 'exceljs';
import { SliceInterface } from '~/shared/policy/common/interfaces/SliceInterface';
import { ResultInterface as Campaign } from '~/shared/policy/find.contract';
import { PgCursorHandler } from '../../interfaces/PromisifiedPgCursor';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { SlicesInterface } from './../../interfaces/SlicesInterface';
import { DataWorkBookWriter } from './writer/DataWorkbookWriter';
import { SlicesWorkbookWriter } from './writer/SlicesWorkbookWriter';

@provider()
export class BuildExcel {
  constructor(
    private tripRepositoryProvider: TripRepositoryProvider,
    private dataWorkbookWriter: DataWorkBookWriter,
    private slicesWorkbookWriter: SlicesWorkbookWriter,
    private apdfNameProvider: APDFNameProvider,
  ) {}

  async call(
    campaign: Campaign,
    start_date: Date,
    end_date: Date,
    operator_id: number,
  ): Promise<{ filename: string; filepath: string }> {
    const params = { start_date, end_date, operator_id, campaign_id: campaign._id };

    // fetch aggregated data
    const trips = await this.tripRepositoryProvider.getPolicyTripCount(params);
    const amount = await this.tripRepositoryProvider.getPolicyTotalAmount(params);

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
    await this.callDataWorkbookWriter(campaign, start_date, end_date, operator_id, workbookWriter);
    await this.callSlicesWorkbookWriter(campaign, start_date, end_date, operator_id, workbookWriter);
    await workbookWriter.commit();

    return { filename, filepath };
  }

  private async callSlicesWorkbookWriter(
    campaign: Campaign,
    start_date: Date,
    end_date: Date,
    operator_id: number,
    workbookWriter: stream.xlsx.WorkbookWriter,
  ) {
    try {
      const arrayOfSlices = campaign.params.slices || [];
      // No slice if no progressive_distance slug
      if (arrayOfSlices.length === 0) {
        return;
      }

      // Add upper limit
      // arrayOfSlices.push({ min: Math.max(...distanceRangeRules.map((e) => e.max)) });

      const slices: SlicesInterface[] = await this.getFundCallSlices(
        campaign,
        start_date,
        end_date,
        operator_id,
        arrayOfSlices,
      );

      return await this.slicesWorkbookWriter.call(slices, workbookWriter);
    } catch (e) {
      console.error(`Error while computing slices for campaign ${campaign.name} and operator ${operator_id}`);
      console.debug(e.message);
    }
  }

  private async callDataWorkbookWriter(
    campaign: Campaign,
    start_date: Date,
    end_date: Date,
    operator_id: number,
    workbookWriter: stream.xlsx.WorkbookWriter,
  ): Promise<void> {
    const tripCursor: PgCursorHandler = await this.getTripRepositoryCursor(
      campaign._id,
      start_date,
      end_date,
      operator_id,
    );

    return await this.dataWorkbookWriter.call(tripCursor, workbookWriter);
  }

  public static initWorkbookWriter(filepath: string): stream.xlsx.WorkbookWriter {
    return new stream.xlsx.WorkbookWriter({
      filename: filepath,
    });
  }

  private getFundCallSlices(
    campaign: Campaign,
    start_date: Date,
    end_date: Date,
    operator_id: number,
    arrayOfSlices: SliceInterface[],
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
      arrayOfSlices,
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
