import { BucketName, S3StorageProvider } from '@pdc/provider-file';
import { ContextType, handler, InvalidParamsException } from '@ilos/common';
import { Action } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/buildExcelExport.contract';
import { GetCampaignAndCallBuildExcel } from './excel/GetCampaignAndCallBuildExcel';
import { alias } from '../shared/trip/buildExcelExport.schema';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), ['validate', alias]],
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
    this.setDefaultDates(params);
    await Promise.all(
      params.query.campaign_id.map((c_id) =>
        this.getCampaignAndCallBuildExcel
          .call(c_id, params.query.date.start, params.query.date.end)
          .then((filepath) => this.s3StorageProvider.upload(BucketName.Export, filepath)),
      ),
    );
  }

  private setDefaultDates(params: ParamsInterface) {
    if (!params.query.date) {
      params.query.date = { start: null, end: null };
    }
  }

  private throwInvalidParamsIfMissings(params: ParamsInterface) {
    if (!params.query.territory_id && (!params.query.campaign_id || params.query.campaign_id.length === 0)) {
      throw new InvalidParamsException('Missing territory_id or campaign id parameters');
    }
  }
}
