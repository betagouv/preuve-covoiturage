import { Action as AbstractAction } from '@ilos/core';
import { handler, InvalidParamsException } from '@ilos/common';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';

import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider';
import { alias } from '../shared/acquisition/list.schema';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/list.contract';
import { StatusSearchInterface } from '../interfaces/AcquisitionRepositoryProviderInterface';
import { castUserStringToUTC, subDaysTz, today } from '../helpers';
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
    if (isAfter(startDate, endDate) || isAfter(endDate, todayDate) || isBefore(startDate, subDaysTz(todayDate, 90))) {
      throw new InvalidParamsException('Start/end are not valid');
    }
    return {
      operator_id,
      status,
      start: startDate,
      end: endDate,
      offset: offset || 0,
      limit: limit || 50,
    };
  }
}
