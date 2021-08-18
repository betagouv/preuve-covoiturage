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
    this.throwInvalidParamsIfMissings(params);
    this.castOrSetDefaultDates(params);
    params.query.campaign_id.map((c_id) =>
      this.getCampaignAndCallBuildExcel
        .call(c_id, params.query.date.start, params.query.date.end)
        .then((filepath) => this.s3StorageProvider.upload(BucketName.Export, filepath))
        .catch((error) => console.error('Could not process campaign export')),
    );
  }

  private castOrSetDefaultDates(params: ParamsInterface) {
    if (!params.query.date) {
      params.query.date = { start: null, end: null };
    } else {
      const start = new Date(params.query.date.start);
      const end = new Date(params.query.date.end);
      params.query.date = { start, end };
    }
  }

  private throwInvalidParamsIfMissings(params: ParamsInterface) {
    if (!params.query.campaign_id || params.query.campaign_id.length === 0) {
      throw new InvalidParamsException('Missing territory_id or campaign id parameters');
    }
  }
}
