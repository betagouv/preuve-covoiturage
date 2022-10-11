import { ContextType, handler } from '@ilos/common';
import { Action } from '@ilos/core';
import { BucketName, S3StorageProvider } from '@pdc/provider-file';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { endOfPreviousMonthDate, startOfPreviousMonthDate } from '../helpers/getDefaultDates';
import { ResultInterface as Campaign } from '../shared/policy/find.contract';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/capitalcall/export.contract';
import { alias } from '../shared/capitalcall/export.schema';
import { BuildExcel } from './excel/BuildExcel';
import { CheckCampaign } from './excel/CheckCampaign';
import { TripRepositoryProviderInterfaceResolver } from '../interfaces';

/**
 *
 * yarn workspace @pdc/proxy ilos call capitalcall:export -c '{"call":{"user":{}},"channel":{"service":"trip"}}' -p '{"query":{"date":{"start":"2022-08-01T00:00:00Z","end":"2022-09-01T00:00:00Z"},"campaign_id":[249]},"format":{"tz":"Europe\/Paris"}}'
 */

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
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const { start_date, end_date } = this.castOrGetDefaultDates(params);

    const filepathes: string[] = [];
    await Promise.all(
      params.query.campaign_id.map(async (c_id) => {
        const checkedCampaign: Campaign | void = await this.checkCampaign
          .call(c_id, start_date, end_date)
          .catch((e) => console.info(`Not processing excel funding requests for campaign ${c_id} :${e}`));
        if (!checkedCampaign) {
          return;
        }

        const involvedOperatorIds = await this.tripRepositoryProvider.getPolicyInvolvedOperators(
          checkedCampaign._id,
          start_date,
          end_date,
          checkedCampaign.params.operators,
        );
        await Promise.all(
          involvedOperatorIds.map(async (o_id) => {
            try {
              console.debug(
                `Building excel funding requests for campaign ${checkedCampaign.name}, operator id ${o_id}`,
              );
              const { filename, filepath } = await this.buildExcel.call(checkedCampaign, start_date, end_date, o_id);
              filepathes.push(
                await this.s3StorageProvider.upload(BucketName.Export, filepath, filename, `${checkedCampaign._id}`),
              );
            } catch (error) {
              // eslint-disable-next-line max-len
              const message = `Error processing excel export for campaign ${checkedCampaign.name} and operator id ${o_id}`;
              console.error(message, error);
              filepathes.push(message);
            }
          }),
        );
      }),
    );
    return filepathes;
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
