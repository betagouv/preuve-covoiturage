import { KernelInterfaceResolver, provider } from '@ilos/common';
import { APDFNameProvider } from '@pdc/provider-storage';
import { stream } from 'exceljs';
import { CampaignSearchParamsInterface } from '../../interfaces/APDFRepositoryProviderInterface';
import { SliceStatInterface } from '../../shared/apdf/interfaces/PolicySliceStatInterface';
import { ResultInterface as Campaign } from '../../shared/policy/find.contract';
import { DataRepositoryProvider } from '../APDFRepositoryProvider';
import { SlicesWorksheetWriter } from './SlicesWorksheetWriter';
import { TripsWorksheetWriter } from './TripsWorksheetWriter';
import { wrapSlices } from './wrapSlicesHelper';

@provider()
export class BuildExcel {
  constructor(
    private kernel: KernelInterfaceResolver,
    private apdfRepoProvider: DataRepositoryProvider,
    private TripsWsWriter: TripsWorksheetWriter,
    private slicesWsWriter: SlicesWorksheetWriter,
    private apdfNameProvider: APDFNameProvider,
  ) {}

  public static initWorkbookWriter(filepath: string): stream.xlsx.WorkbookWriter {
    return new stream.xlsx.WorkbookWriter({ filename: filepath, useStyles: true });
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
      total_count: trips,
      total_sum: amount,
      subsidized_count: subsidized,
      slices,
    } = await this.apdfRepoProvider.getPolicyStats(params, wrapSlices(campaign.params.slices));

    // generate the filename and filepath
    const fileParams = {
      name: campaign.name,
      campaign_id: campaign._id,
      operator_id,
      datetime: start_date,
      trips,
      subsidized,
      amount,
    };
    const filename: string = this.apdfNameProvider.filename(fileParams);
    const filepath: string = this.apdfNameProvider.filepath(filename);

    // create the Workbook and add Worksheets
    const wbWriter: stream.xlsx.WorkbookWriter = BuildExcel.initWorkbookWriter(filepath);
    if (this.hasSliceTrips(slices)) await this.writeSlices(wbWriter, slices);
    await this.writeTrips(wbWriter, params);
    await wbWriter.commit();

    return { filename, filepath };
  }

  private async writeTrips(wkw: stream.xlsx.WorkbookWriter, params: CampaignSearchParamsInterface): Promise<void> {
    try {
      const booster_dates = await this.listBoosterDates(params.campaign_id);
      const tripCursor = await this.apdfRepoProvider.getPolicyCursor(params);
      await this.TripsWsWriter.call(tripCursor, booster_dates, wkw);
    } catch (e) {
      console.error('[apdf:buildExcel] Error while writing trips');
      console.error(e.message);
      console.error(e.stack);
    }
  }

  private async writeSlices(wkw: stream.xlsx.WorkbookWriter, slices: SliceStatInterface[]): Promise<void> {
    try {
      if (!slices.length) return;
      await this.slicesWsWriter.call(wkw, slices);
    } catch (e) {
      console.error('[apdf:buildExcel] Error while computing slices');
      console.error(e.message);
    }
  }

  private hasSliceTrips(slices: SliceStatInterface[]): boolean {
    return slices.reduce((acc, s) => acc + s.count, 0) > 0;
  }

  private async listBoosterDates(campaign_id: number): Promise<Set<string>> {
    const campaign = await this.kernel.call(
      'campaign:find',
      { _id: campaign_id },
      { channel: { service: 'apdf' }, call: { user: { permissions: ['registry.policy.find'] } } },
    );

    return new Set<string>(campaign?.params?.booster_dates);
  }
}
