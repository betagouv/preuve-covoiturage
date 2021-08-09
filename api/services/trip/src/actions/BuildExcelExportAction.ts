import { ContextType, handler, InvalidParamsException } from '@ilos/common';
import { Action } from '@ilos/core';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/buildExcelExport.contract';
import { GetCampaignAndCallBuildExcel } from './logic/GetCampaignAndCallBuildExcel';

@handler({
  ...handlerConfig,
  // middlewares: [
  //   ['validate', alias]
  // ]
})
export class BuildExcelExportAction extends Action {
  constructor(private getCampaignAndCallBuildExcel: GetCampaignAndCallBuildExcel) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    if (!params.query.territory_id && (!params.query.campaign_id || params.query.campaign_id.length === 0)) {
      throw new InvalidParamsException({
        params: params,
        messsage: 'Missing territory_id or campaign id',
      });
    }
    if (!params.query.date) {
      params.query.date = { start: null, end: null };
    }
    await Promise.all(
      params.query.campaign_id.map((c_id) => {
        this.getCampaignAndCallBuildExcel.call(c_id, params.query.date.start, params.query.date.end);
      }),
    );
  }
}
