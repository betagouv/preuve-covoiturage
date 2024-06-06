import { Action as AbstractAction } from '/ilos/core/index.ts';
import { handler, InvalidParamsException } from '/ilos/common/index.ts';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '/pdc/providers/middleware/index.ts';

import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider.ts';
import { alias } from '/shared/acquisition/list.schema.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '/shared/acquisition/list.contract.ts';
import { StatusSearchInterface } from '../interfaces/AcquisitionRepositoryProviderInterface.ts';
import { castUserStringToUTC, subDaysTz, today } from '../helpers/index.ts';
import { isAfter, isBefore } from 'date-fns';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({ operator: 'operator.acquisition.status' }),
  ],
})
export class ListJourneyAction extends AbstractAction {
  constructor(private acquisitionRepository: AcquisitionRepositoryProvider) {
    super();
  }

  protected async handle(params: ParamsInterface): Promise<ResultInterface> {
    const acquisitions = await this.acquisitionRepository.list(this.applyDefault(params));
    return acquisitions;
  }

  protected applyDefault(params: ParamsInterface): StatusSearchInterface {
    const { operator_id, start, end, status, offset, limit } = params;
    const todayDate = today();
    const endDate = castUserStringToUTC(end || todayDate);
    const startDate = castUserStringToUTC(start || subDaysTz(todayDate, 7));
    this.validateStartEnd(startDate, endDate, todayDate);

    return {
      operator_id,
      status,
      start: startDate,
      end: endDate,
      offset: offset || 0,
      limit: limit || 50,
    };
  }

  protected validateStartEnd(startDate: Date, endDate: Date, todayDate: Date) {
    if (isAfter(startDate, endDate)) {
      throw new InvalidParamsException('Start should be before end');
    }
    if (isAfter(endDate, todayDate)) {
      throw new InvalidParamsException('End should be before now');
    }
    const maxStartDate = subDaysTz(todayDate, 90);
    if (isBefore(startDate, maxStartDate)) {
      throw new InvalidParamsException(`Start should be after ${maxStartDate.toISOString()}`);
    }
  }
}
