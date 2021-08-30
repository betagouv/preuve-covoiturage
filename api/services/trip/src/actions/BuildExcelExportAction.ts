import { BucketName, S3StorageProvider } from '@pdc/provider-file';
import { ContextType, handler, InvalidParamsException } from '@ilos/common';
import { Action } from '@ilos/core';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/excelExport.contract';
import { GetCampaignAndCallBuildExcel } from './excel/GetCampaignAndCallBuildExcel';
import { alias } from '../shared/trip/excelExport.schema';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias], hasPermissionMiddleware('registry.trip.excelExport')],
})
export class BuildExcelExportAction extends Action {
  constructor(
    private getCampaignAndCallBuildExcel: GetCampaignAndCallBuildExcel,
    private s3StorageProvider: S3StorageProvider,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const { start_date, end_date } = this.castOrGetDefaultDates(params);
    params.query.campaign_id.map((c_id) =>
      this.getCampaignAndCallBuildExcel
        .call(c_id, start_date, end_date)
        .then((filepath) => this.s3StorageProvider.upload(BucketName.Export, filepath))
        .catch((error) => console.error('Could not process campaign export')),
    );
  }

  private castOrGetDefaultDates(params: ParamsInterface): { start_date: Date; end_date: Date } {
    if (!params.query.date) {
      return { start_date: null, end_date: null };
    } else {
      const start_date = new Date(params.query.date.start);
      const end_date = new Date(params.query.date.end);
      return { start_date, end_date };
    }
  }
}
