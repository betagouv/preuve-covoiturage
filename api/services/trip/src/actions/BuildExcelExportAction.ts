import { GetCampaignInvolvedOperator } from './excel/GetCampaignInvolvedOperators';
import { ContextType, handler } from '@ilos/common';
import { Action } from '@ilos/core';
import { BucketName, S3StorageProvider } from '@pdc/provider-file';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/excelExport.contract';
import { alias } from '../shared/trip/excelExport.schema';
import { CheckCampaign } from './excel/CheckCampaign';
import { ResultInterface as Campaign } from '../shared/policy/find.contract';
import { BuildExcel } from './excel/BuildExcel';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias]],
})
export class BuildExcelsExportAction extends Action {
  constructor(
    private checkCampaign: CheckCampaign,
    private s3StorageProvider: S3StorageProvider,
    private getCampaignInvolvedOperator: GetCampaignInvolvedOperator,
    private buildExcel: BuildExcel,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const { start_date, end_date } = this.castOrGetDefaultDates(params);

    const filepathes: string[] = [];
    await Promise.all(
      params.query.campaign_id.map(async (c_id) => {
        const checkedCampaign: Campaign = await this.checkCampaign.call(c_id, start_date, end_date);
        const involed_operators: number[] = await this.getCampaignInvolvedOperator.call(
          checkedCampaign,
          start_date,
          end_date,
        );

        involed_operators.map(async (o_id) => {
          try {
            const filepath = await this.buildExcel.call(
              checkedCampaign._id,
              start_date,
              end_date,
              checkedCampaign.name,
              o_id,
            );
            const s3key = await this.s3StorageProvider.upload(BucketName.Export, filepath);
            filepathes.push(s3key);
          } catch (error) {
            // eslint-disable-next-line max-len
            const message = `Error processing excel export for campaign ${checkedCampaign.name} and operator id ${o_id}`;
            console.error(message, error);
            filepathes.push(message);
          }
        });
      }),
    );
    return filepathes;
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
