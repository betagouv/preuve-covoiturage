import { ContextType, handler, ConfigInterfaceResolver } from '@ilos/common';
import { Action } from '@ilos/core';
import { BucketName, S3StorageProvider } from '@pdc/provider-file';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import fs from 'fs';
import { endOfPreviousMonthDate, startOfPreviousMonthDate } from '../helpers/getDefaultDates';
import { TripRepositoryProviderInterfaceResolver } from '../interfaces';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/capitalcall/export.contract';
import { alias } from '../shared/capitalcall/export.schema';
import { ResultInterface as Campaign } from '../shared/policy/find.contract';
import { BuildExcel } from './excel/BuildExcel';
import { CheckCampaign } from './excel/CheckCampaign';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares('trip'), ['validate', alias]],
})
export class ExportCapitalCallsAction extends Action {
  constructor(
    private checkCampaign: CheckCampaign,
    private s3StorageProvider: S3StorageProvider,
    private tripRepositoryProvider: TripRepositoryProviderInterfaceResolver,
    private buildExcel: BuildExcel,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const { start_date, end_date } = this.castOrGetDefaultDates(params);

    const files: string[] = [];
    await Promise.all(
      params.query.campaign_id.map(async (c_id) => {
        // Make sure the campaign is active and within the date range
        const campaign: Campaign | void = await this.checkCampaign
          .call(c_id, start_date, end_date)
          .catch((e) => console.error(`Failed APDF export (campaign ${c_id})`, e));

        if (!campaign) return;

        // List operators having subsidized trips
        const activeOperatorIds = await this.tripRepositoryProvider.getPolicyActiveOperators(
          campaign._id,
          start_date,
          end_date,
        );

        if (!activeOperatorIds.length) console.info(`Exporting APDF: No active operators for ${campaign.name}`);

        // Generate XLSX files for each operator and upload to S3 storage
        await Promise.all(
          activeOperatorIds.map(async (o_id) => {
            try {
              console.debug(`Exporting APDF: campaign ${campaign.name}, operator id ${o_id}`);
              const { filename, filepath } = await this.buildExcel.call(campaign, start_date, end_date, o_id);

              if (!this.config.get('apdf.s3UploadEnabled')) {
                console.warn('APDF Upload disabled. Set APP_APDF_S3_UPLOAD_ENABLED=true to upload to S3');
                return;
              }

              const file = await this.s3StorageProvider.upload(BucketName.APDF, filepath, filename, `${campaign._id}`);

              // maybe delete the file
              try {
                fs.unlinkSync(filepath);
              } catch (e) {
                console.warn(`Failed to unlink ${filepath} - ${e.message}`);
              }

              files.push(file);
            } catch (error) {
              // eslint-disable-next-line max-len
              const message = `Failed APDF export for operator ${o_id} (campaign ${campaign._id})`;
              console.error(message, error);
              files.push(message);
            }
          }),
        );
      }),
    );

    return files;
  }

  private castOrGetDefaultDates(params: ParamsInterface): { start_date: Date; end_date: Date } {
    if (!params.query.date) {
      const endDate: Date = endOfPreviousMonthDate(params.format?.tz);
      const startDate: Date = startOfPreviousMonthDate(endDate, params.format?.tz);
      return { start_date: startDate, end_date: endDate };
    } else {
      const start_date = new Date(params.query.date.start);
      const end_date = new Date(params.query.date.end);
      return { start_date, end_date };
    }
  }
}
